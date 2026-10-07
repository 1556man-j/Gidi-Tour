import { json } from '@sveltejs/kit';
import {
	markOrderPaid,
	getOrderStatus,
	markOrderEmailSent,
	getMagazineDownloadFiles
} from '$lib/sanity/queries/storeOrder';
import { sendStoreOrderConfirmationEmails } from '$lib/server/storeEmail';
import { sanityFileUrl } from '$lib/sanity/fileUrl';
import { fetchDlocalPayment } from '$lib/server/dlocalVerify';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	let payload: { id?: string };

	try {
		payload = await request.json();
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!payload.id) {
		return json({ error: 'Missing payment id.' }, { status: 400 });
	}

	// Only act on what dLocal itself confirms, never on the request body alone.
	const payment = await fetchDlocalPayment(payload.id);

	if (!payment) {
		return json({ error: 'Could not verify payment with dLocal.' }, { status: 502 });
	}

	if (payment.status === 'PAID') {
		const orderId = payment.order_id;

		const existingOrder = await getOrderStatus(orderId);

		if (!existingOrder) {
			console.error(`Order ${orderId} was not found in Sanity.`);
			return json({ received: true, warning: 'Order not found.' });
		}

		if (existingOrder.paymentStatus !== 'paid') {
			await markOrderPaid(orderId, {
				amountCharged: Math.round(payment.amount * 100),
				currency: payment.currency,
				dlocalPaymentId: payment.id
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