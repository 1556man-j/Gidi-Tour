import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import {
	markBookingPaid,
	getBookingStatus,
	markBookingEmailSent
} from '$lib/sanity/queries/booking';
import { sendBookingConfirmationEmails } from '$lib/server/bookingEmail';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
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

	console.log(`Stripe webhook received: ${event.type}`);

	// =========================================================
	// PAYMENT SUCCEEDED
	// =========================================================

	if (event.type === 'payment_intent.succeeded') {
		const intent = event.data.object;

		const bookingId = intent.metadata?.bookingId;

		console.log('PaymentIntent:', intent.id);
		console.log('Booking ID:', bookingId);

		if (!bookingId) {
			console.error('Payment succeeded but Stripe PaymentIntent has no bookingId.');

			// The payment itself succeeded, so acknowledge the event.
			return json({
				received: true,
				warning: 'No bookingId found in PaymentIntent metadata.'
			});
		}

		try {
			// -----------------------------------------------------
			// 1. Get the booking first
			// -----------------------------------------------------

			const existingBooking = await getBookingStatus(bookingId);

			if (!existingBooking) {
				console.error(`Booking ${bookingId} was not found in Sanity.`);

				// Returning 500 makes Stripe retry the webhook.
				return json(
					{
						error: 'Booking not found in Sanity.'
					},
					{ status: 500 }
				);
			}

			console.log(`Booking ${bookingId} found. Current status: ${existingBooking.paymentStatus}`);

			// -----------------------------------------------------
			// 2. Mark booking as paid
			// -----------------------------------------------------

			if (existingBooking.paymentStatus !== 'paid') {
				await markBookingPaid(bookingId, {
					amountCharged: intent.amount,
					currency: intent.currency.toUpperCase(),
					stripePaymentIntentId: intent.id
				});

				console.log(`Booking ${bookingId} marked as PAID.`);
			} else {
				console.log(`Booking ${bookingId} was already marked as PAID.`);
			}

			// -----------------------------------------------------
			// 3. Get the updated booking
			// -----------------------------------------------------

			const booking = await getBookingStatus(bookingId);

			if (!booking) {
				console.error(`Could not retrieve updated booking ${bookingId}.`);

				return json(
					{
						error: 'Could not retrieve booking.'
					},
					{ status: 500 }
				);
			}

			// -----------------------------------------------------
			// 4. Send confirmation emails
			// -----------------------------------------------------

			if (!booking.confirmationEmailSent) {
				await sendBookingConfirmationEmails({
					name: booking.name,
					email: booking.email,
					amountGBP: booking.amountGBP,
					amountCharged: booking.amountCharged,
					currency: booking.currency,
					paymentMethod: 'stripe',
					bookingId: booking._id,
					destination: booking.destination,
					startDate: booking.startDate,
					endDate: booking.endDate,
					travelers: booking.travelers,
					tours: booking.tours || []
				});

				await markBookingEmailSent(bookingId);

				console.log(`Confirmation emails sent for booking ${bookingId}.`);
			} else {
				console.log(`Confirmation emails already sent for booking ${bookingId}.`);
			}
		} catch (error) {
			console.error(`Failed processing Stripe payment for booking ${bookingId}:`, error);

			// Tell Stripe the webhook failed so Stripe can retry it.
			return json(
				{
					error: 'Webhook processing failed.'
				},
				{ status: 500 }
			);
		}
	}

	// =========================================================
	// OTHER STRIPE EVENTS
	// =========================================================

	return json({ received: true });
};
