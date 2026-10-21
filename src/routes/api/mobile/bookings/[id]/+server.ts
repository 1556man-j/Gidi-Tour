import { json } from '@sveltejs/kit';
import { getBookingByIdForCustomer } from '$lib/sanity/queries/booking';
import { getStoreOrderByIdForCustomer } from '$lib/sanity/queries/storeOrder';
import { buildDownloadLinks } from '$lib/server/magazineDownload';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params, url }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const booking = await getBookingByIdForCustomer(params.id, session.user.id);
	if (booking) return json({ booking: { ...booking, kind: 'tour' }, storeOrder: null, downloadLinks: [] });

	const order = await getStoreOrderByIdForCustomer(params.id, session.user.id, session.user.email);
	if (!order) return json({ error: 'Booking not found.' }, { status: 404 });

	const downloadLinks = await buildDownloadLinks(url.origin, order as Parameters<typeof buildDownloadLinks>[1]);
	return json({ booking: null, storeOrder: { ...order, kind: 'store', amountGBP: order.subtotal }, downloadLinks });
};
