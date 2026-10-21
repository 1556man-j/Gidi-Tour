import { json } from '@sveltejs/kit';
import { getBookingsForCustomer } from '$lib/sanity/queries/booking';
import { getStoreOrdersForCustomer } from '$lib/sanity/queries/storeOrder';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const [tourBookings, storeOrders] = await Promise.all([
		getBookingsForCustomer(session.user.id),
		getStoreOrdersForCustomer(session.user.id, session.user.email)
	]);

	const bookings = [
		...tourBookings.map((b: any) => ({ ...b, kind: 'tour' as const })),
		...storeOrders.map((o: any) => ({ ...o, kind: 'store' as const, amountGBP: o.subtotal }))
	].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

	return json({ bookings });
};
