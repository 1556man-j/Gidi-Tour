import { json } from '@sveltejs/kit';
import { getOrderStatus } from '$lib/sanity/queries/storeOrder';
import { reconcileDlocalOrder } from '$lib/server/paymentSettlement';
import type { RequestHandler } from './$types';

// Guests can check out in the store, so this works without login (the order id is an unguessable UUID,
// same as the website's confirmation page) and only returns what that page shows.
export const GET: RequestHandler = async ({ params, url }) => {
	const found = await getOrderStatus(params.id);
	if (!found) return json({ error: 'Order not found.' }, { status: 404 });

	const order = (await reconcileDlocalOrder(found, url.origin)) ?? found;
	return json({
		paymentStatus: order.paymentStatus,
		items: order.items ?? [],
		subtotal: order.subtotal,
		amountCharged: order.amountCharged,
		currency: order.currency
	});
};
