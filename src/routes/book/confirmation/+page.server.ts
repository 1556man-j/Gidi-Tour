import { error } from '@sveltejs/kit';
import { getBookingStatus } from '$lib/sanity/queries/booking';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const bookingId = url.searchParams.get('bookingId');

	if (!bookingId) {
		throw error(400, 'Missing booking reference.');
	}

	const booking = await getBookingStatus(bookingId);

	if (!booking) {
		throw error(404, 'Booking not found.');
	}

	return {
		booking,
		bookingId
	};
};