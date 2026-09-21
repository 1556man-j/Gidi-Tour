import { json } from '@sveltejs/kit';
import { markBookingPaid, getBookingStatus } from '$lib/sanity/queries/booking';
import { sendBookingConfirmationEmails } from '$lib/server/bookingEmail';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json();

	// dLocal sends payment status updates here — 'PAID' means success
	if (payload.status === 'PAID') {
		const bookingId = payload.order_id;

		await markBookingPaid(bookingId, {
			amountCharged: Math.round(payload.amount * 100),
			currency: payload.currency,
			dlocalPaymentId: payload.id
		});

		const booking = await getBookingStatus(bookingId);

		if (booking) {
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
		}
	}

	return json({ received: true });
};
