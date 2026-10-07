import { json } from '@sveltejs/kit';
import {
	markBookingPaid,
	getBookingStatus,
	markBookingEmailSent
} from '$lib/sanity/queries/booking';
import { sendBookingConfirmationEmails } from '$lib/server/bookingEmail';
import { fetchDlocalPayment } from '$lib/server/dlocalVerify';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let payload: { id?: string; status?: string; order_id?: string };

	try {
		payload = await request.json();
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!payload.id) {
		return json({ error: 'Missing payment id.' }, { status: 400 });
	}

	// Only act on what dLocal itself confirms, never on the request body alone.
	const payment = await fetchDlocalPayment(payload.id);

	if (!payment) {
		return json({ error: 'Could not verify payment with dLocal.' }, { status: 502 });
	}

	if (payment.status === 'PAID') {
		const bookingId = payment.order_id;

		try {
			const existingBooking = await getBookingStatus(bookingId);

			if (!existingBooking) {
				console.error(`Booking ${bookingId} was not found in Sanity.`);
				return json({ error: 'Booking not found.' }, { status: 404 });
			}

			if (existingBooking.paymentStatus !== 'paid') {
				await markBookingPaid(bookingId, {
					amountCharged: Math.round(payment.amount * 100),
					currency: payment.currency,
					dlocalPaymentId: payment.id
				});
			}

			const booking = await getBookingStatus(bookingId);

			if (!booking) {
				return json({ error: 'Could not retrieve booking.' }, { status: 500 });
			}

			if (!booking.confirmationEmailSent) {
				await sendBookingConfirmationEmails({
					name: booking.name,
					email: booking.email,
					amountGBP: booking.amountGBP,
					amountCharged: booking.amountCharged,
					currency: booking.currency,
					paymentMethod: 'dlocal',
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
			console.error(`Failed processing dLocal payment for booking ${bookingId}:`, error);

			return json({ error: 'Webhook processing failed.' }, { status: 500 });
		}
	}

	return json({ received: true });
};