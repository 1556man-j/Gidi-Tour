import { json } from '@sveltejs/kit';
import { markOrderPaid, getOrderStatus, markOrderEmailSent, getMagazineDownloadFiles } from '$lib/sanity/queries/storeOrder';
import { sendStoreOrderConfirmationEmails } from '$lib/server/storeEmail';
import { sanityFileUrl } from '$lib/sanity/fileUrl';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const payload = await request.json();

	// dLocal sends payment status updates here — 'PAID' means success
	if (payload.status === 'PAID') {
		const orderId = payload.order_id;

		const existingOrder = await getOrderStatus(orderId);

		if (!existingOrder) {
			console.error(`Order ${orderId} was not found in Sanity.`);
			return json({ received: true, warning: 'Order not found.' });
		}

		if (existingOrder.paymentStatus !== 'paid') {
			await markOrderPaid(orderId, {
				amountCharged: Math.round(payload.amount * 100),
				currency: payload.currency,
				dlocalPaymentId: payload.id
			});
		}

		const order = await getOrderStatus(orderId);

		if (order && !order.confirmationEmailSent) {
			const magazineSlugs = (order.items ?? [])
				.filter((item: { category: string }) => item.category === 'magazine')
				.map((item: { id: string }) => item.id);

			const magazineFiles = await getMagazineDownloadFiles(magazineSlugs);

			const downloadLinks = magazineFiles
				.filter(
					(product: { digitalFile?: { asset?: { _ref: string } } }) =>
						product.digitalFile?.asset?._ref
				)
				.map((product: { title: string; digitalFile: { asset: { _ref: string } } }) => ({
					title: product.title,
					url: sanityFileUrl(product.digitalFile.asset._ref)
				}));

			await sendStoreOrderConfirmationEmails({
				name: order.name,
				email: order.email,
				orderId: order._id,
				items: order.items || [],
				subtotal: order.subtotal,
				amountCharged: order.amountCharged,
				currency: order.currency,
				paymentMethod: 'dlocal',
				shipping: order.shipping,
				downloadLinks
			});

			await markOrderEmailSent(orderId);
		}
	}

	return json({ received: true });
};