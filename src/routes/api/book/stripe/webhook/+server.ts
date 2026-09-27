import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { STRIPE_WEBHOOK_SECRET } from '$env/static/private';
import {
	markBookingPaid,
	getBookingStatus,
	markBookingEmailSent
} from '$lib/sanity/queries/booking';
import {
	markOrderPaid,
	getOrderStatus,
	markOrderEmailSent,
	getMagazineDownloadFiles
} from '$lib/sanity/queries/storeOrder';
import { sendBookingConfirmationEmails } from '$lib/server/bookingEmail';
import { sendStoreOrderConfirmationEmails } from '$lib/server/storeEmail';
import { sanityFileUrl } from '$lib/sanity/fileUrl';
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

	if (event.type === 'payment_intent.succeeded') {
		const intent = event.data.object;

		const bookingId = intent.metadata?.bookingId;
		const orderId = intent.metadata?.orderId;

		console.log('PaymentIntent:', intent.id);

		// =========================================================
		// BOOKING PAYMENT (existing flow, unchanged)
		// =========================================================

		if (bookingId) {
			console.log('Booking ID:', bookingId);

			try {
				const existingBooking = await getBookingStatus(bookingId);

				if (!existingBooking) {
					console.error(`Booking ${bookingId} was not found in Sanity.`);
					return json({ error: 'Booking not found in Sanity.' }, { status: 500 });
				}

				console.log(`Booking ${bookingId} found. Current status: ${existingBooking.paymentStatus}`);

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

				const booking = await getBookingStatus(bookingId);

				if (!booking) {
					console.error(`Could not retrieve updated booking ${bookingId}.`);
					return json({ error: 'Could not retrieve booking.' }, { status: 500 });
				}

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
				return json({ error: 'Webhook processing failed.' }, { status: 500 });
			}

			return json({ received: true });
		}

		// =========================================================
		// STORE ORDER PAYMENT (new)
		// =========================================================

		if (orderId) {
			console.log('Order ID:', orderId);

			try {
				const existingOrder = await getOrderStatus(orderId);

				if (!existingOrder) {
					console.error(`Order ${orderId} was not found in Sanity.`);
					return json({ error: 'Order not found in Sanity.' }, { status: 500 });
				}

				console.log(`Order ${orderId} found. Current status: ${existingOrder.paymentStatus}`);

				if (existingOrder.paymentStatus !== 'paid') {
					await markOrderPaid(orderId, {
						amountCharged: intent.amount,
						currency: intent.currency.toUpperCase(),
						stripePaymentIntentId: intent.id
					});
					console.log(`Order ${orderId} marked as PAID.`);
				} else {
					console.log(`Order ${orderId} was already marked as PAID.`);
				}

				const order = await getOrderStatus(orderId);

				if (!order) {
					console.error(`Could not retrieve updated order ${orderId}.`);
					return json({ error: 'Could not retrieve order.' }, { status: 500 });
				}

				if (!order.confirmationEmailSent) {
					// Build permanent download links for any magazine items in this order.
					const magazineSlugs = (order.items ?? [])
						.filter((item: { category: string }) => item.category === 'magazine')
						.map((item: { id: string }) => item.id);

					const magazineFiles = await getMagazineDownloadFiles(magazineSlugs);

					const downloadLinks = magazineFiles
						.filter((product: { digitalFile?: { asset?: { _ref: string } } }) => product.digitalFile?.asset?._ref)
						.map((product: { title: string; digitalFile: { asset: { _ref: string } } }) => ({
							title: product.title,
							url: sanityFileUrl(product.digitalFile.asset._ref)
						}));

					await sendStoreOrderConfirmationEmails({
						name: order.name,
						email: order.email,
						orderId: order._id,
						items: order.items || [],
						subtotal: order.subtotal,
						amountCharged: order.amountCharged,
						currency: order.currency,
						paymentMethod: 'stripe',
						shipping: order.shipping,
						downloadLinks
					});

					await markOrderEmailSent(orderId);
					console.log(`Confirmation emails sent for order ${orderId}.`);
				} else {
					console.log(`Confirmation emails already sent for order ${orderId}.`);
				}
			} catch (error) {
				console.error(`Failed processing Stripe payment for order ${orderId}:`, error);
				return json({ error: 'Webhook processing failed.' }, { status: 500 });
			}

			return json({ received: true });
		}

		console.error('Payment succeeded but Stripe PaymentIntent has no bookingId or orderId.');
		return json({
			received: true,
			warning: 'No bookingId or orderId found in PaymentIntent metadata.'
		});
	}

	return json({ received: true });
};