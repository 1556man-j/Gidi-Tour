import { error } from '@sveltejs/kit';
import { getOrderStatus } from '$lib/sanity/queries/storeOrder';
import { reconcileDlocalOrder } from '$lib/server/paymentSettlement';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const orderId = url.searchParams.get('orderId');

	if (!orderId) {
		throw error(400, 'Missing order reference.');
	}

	let order = await getOrderStatus(orderId);

	if (!order) {
		throw error(404, 'Order not found.');
	}

	// If dLocal sent the customer back before the webhook arrived, ask dLocal
	// directly. The browser return itself never marks anything as paid.
	order = await reconcileDlocalOrder(order, url.origin);

	return {
		orderId,
		order: {
			name: order.name,
			email: order.email,
			items: order.items ?? [],
			subtotal: order.subtotal,
			paymentStatus: order.paymentStatus,
			paymentMethod: order.paymentMethod
		}
	};
};
