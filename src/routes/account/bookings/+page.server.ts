import { redirect } from '@sveltejs/kit';
import { getBookingsForCustomer } from '$lib/sanity/queries/booking';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.id) {
		throw redirect(303, '/login?redirectTo=/account/bookings');
	}

	const bookings = await getBookingsForCustomer(session.user.id);

	return { bookings, session };
};