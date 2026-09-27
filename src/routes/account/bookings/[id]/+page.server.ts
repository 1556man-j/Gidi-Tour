import { error, redirect } from '@sveltejs/kit';
import { getBookingByIdForCustomer } from '$lib/sanity/queries/booking';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.id) {
		throw redirect(303, `/login?redirectTo=/account/bookings/${event.params.id}`);
	}

	const booking = await getBookingByIdForCustomer(event.params.id, session.user.id);

	if (!booking) {
		throw error(404, 'Booking not found');
	}

	return { booking };
};