import { error } from '@sveltejs/kit';
import { getBookingStatus } from '$lib/sanity/queries/booking';
import { reconcileDlocalBooking } from '$lib/server/paymentSettlement';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const bookingId = url.searchParams.get('bookingId');

	if (!bookingId) {
		throw error(400, 'Missing booking reference.');
	}

	let booking = await getBookingStatus(bookingId);

	if (!booking) {
		throw error(404, 'Booking not found.');
	}

	// If dLocal sent the customer back before the webhook arrived, ask dLocal
	// directly. The browser return itself never marks anything as paid.
	booking = await reconcileDlocalBooking(booking);

	// Send the browser only what this page shows (no phone, notes or other private fields).
	return {
		bookingId,
		booking: {
			destination: booking.destination,
			name: booking.name,
			email: booking.email,
			startDate: booking.startDate,
			endDate: booking.endDate,
			travelers: booking.travelers,
			paymentStatus: booking.paymentStatus,
			paymentMethod: booking.paymentMethod,
			amountCharged: booking.amountCharged,
			currency: booking.currency
		}
	};
};
