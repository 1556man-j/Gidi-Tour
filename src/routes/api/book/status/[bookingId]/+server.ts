import { json } from '@sveltejs/kit';
import { getBookingStatus } from '$lib/sanity/queries/booking';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const bookingId = params.bookingId;

		if (!bookingId) {
			return json({ error: 'Missing booking ID.' }, { status: 400 });
		}

		const booking = await getBookingStatus(bookingId);

		if (!booking) {
			return json({ error: 'Booking not found.' }, { status: 404 });
		}

		return json({
			bookingId: booking._id,
			paymentStatus: booking.paymentStatus,
			confirmationEmailSent: booking.confirmationEmailSent ?? false
		});
	} catch (error) {
		console.error('Booking status check failed:', error);

		return json({ error: 'Could not check booking status.' }, { status: 500 });
	}
};
