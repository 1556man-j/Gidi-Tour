import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import { settleBooking, settleOrder, type VerifiedPayment } from '$lib/server/paymentSettlement';
import { markByStripeIntent } from '$lib/server/paymentRecords';
import type { RequestHandler } from './$types';

// In the Stripe dashboard, send this endpoint these events:
//   payment_intent.succeeded, payment_intent.payment_failed,
//   charge.refunded, charge.dispute.created

export const POST: RequestHandler = async ({ request, url }) => {
	const rawBody = await request.text();
	const signature = request.headers.get('stripe-signature');

	if (!signature) {
		console.error('Stripe webhook: missing signature');
		return json({ error: 'Missing Stripe signature.' }, { status: 400 });
	}

	let event;

	try {
		event = stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
	} catch (error) {
		console.error('Stripe webhook signature verification failed:', error);
		return json({ error: 'Invalid Stripe signature.' }, { status: 400 });
	}

	try {
		// ------------------------------------------------------------------
		// Payment succeeded or failed
		// ------------------------------------------------------------------
		if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
			const intent = event.data.object;

			const payment: VerifiedPayment = {
				provider: 'stripe',
				paymentId: intent.id,
				status: event.type === 'payment_intent.succeeded' ? 'paid' : 'failed',
				amountMinor: intent.amount,
				currency: intent.currency
			};

			const bookingId = intent.metadata?.bookingId;
			const orderId = intent.metadata?.orderId;

			if (!bookingId && !orderId) {
				console.error('Stripe event has no bookingId or orderId in the PaymentIntent metadata.');
				return json({ received: true, warning: 'No bookingId or orderId in metadata.' });
			}

			const result = bookingId
				? await settleBooking(bookingId, payment)
				: await settleOrder(orderId as string, payment, url.origin);

			if (result === 'not_found') {
				console.error(`Stripe payment ${intent.id}: record ${bookingId ?? orderId} not found.`);
				// 500 makes Stripe retry, in case the record just hasn't appeared yet.
				return json({ error: 'Record not found.' }, { status: 500 });
			}

			return json({ received: true, result });
		}

		// ------------------------------------------------------------------
		// Refund or dispute: flag the record (this also blocks magazine downloads)
		// ------------------------------------------------------------------
		if (event.type === 'charge.refunded') {
			const charge = event.data.object;
			const intentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : null;

			// Only a full refund changes the status. Partial refunds are left for you to handle.
			if (intentId && charge.refunded) await markByStripeIntent(intentId, 'refunded');
		}

		if (event.type === 'charge.dispute.created') {
			const dispute = event.data.object;
			const intentId = typeof dispute.payment_intent === 'string' ? dispute.payment_intent : null;

			if (intentId) await markByStripeIntent(intentId, 'disputed');
		}
	} catch (error) {
		console.error(`Stripe webhook processing failed for ${event.type}:`, error);
		return json({ error: 'Webhook processing failed.' }, { status: 500 });
	}

	return json({ received: true });
};
