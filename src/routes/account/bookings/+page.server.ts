import { redirect } from '@sveltejs/kit';
import { getBookingsForCustomer } from '$lib/sanity/queries/booking';
import { getStoreOrdersForCustomer } from '$lib/sanity/queries/storeOrder';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.id) {
		throw redirect(303, '/login?redirectTo=/account/bookings');
	}

	const [tourBookings, storeOrders] = await Promise.all([
		getBookingsForCustomer(session.user.id),
		getStoreOrdersForCustomer(session.user.id, session.user.email)
	]);

	const bookings = [
		...tourBookings.map((b: any) => ({ ...b, kind: 'tour' as const })),
		...storeOrders.map((o: any) => ({
			...o,
			kind: 'store' as const,
			amountGBP: o.subtotal
		}))
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return { bookings, session };
};