import { json } from '@sveltejs/kit';
import {
	createPendingOrder,
	markOrderPaid,
	markOrderEmailSent,
	getMagazineDownloadFiles,
	type StoreOrderItemInput
} from '$lib/sanity/queries/storeOrder';
import { getStoreProducts } from '$lib/sanity/queries/store';
import { sendStoreOrderConfirmationEmails } from '$lib/server/storeEmail';
import { sanityFileUrl } from '$lib/sanity/fileUrl';
import { isFreeProduct } from '$lib/storePricing';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const body = await request.json();
		const session = await locals.auth();

		const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
		const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';

		if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json({ error: 'Please enter a valid name and email.' }, { status: 400 });
		}

		if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 20) {
			return json({ error: 'Your cart is empty.' }, { status: 400 });
		}

		// Check every item against Sanity. Anything that is not a free magazine
		// is refused, so this route can never be used to get a paid item for free.
		const products = await getStoreProducts();
		const productBySlug = new Map(products.map((p) => [p.slug.current, p]));

		const items: StoreOrderItemInput[] = [];

		for (const raw of body.items) {
			const product = productBySlug.get(raw?.id);

			if (!product) {
				return json({ error: 'One of the items is no longer available.' }, { status: 400 });
			}

			if (!isFreeProduct(product)) {
				return json({ error: 'This order contains items that are not free.' }, { status: 400 });
			}

			items.push({
				id: product.slug.current,
				category: 'magazine',
				title: product.title,
				price: 0,
				quantity: 1
			});
		}

		const countryCode = cookies.get('visitor_country') ?? 'GB';

		const order = await createPendingOrder({
			items,
			subtotal: 0,
			name,
			email,
			shipping: null,
			countryCode,
			currencyCode: 'gbp',
			paymentMethod: 'free',
			customerId: session?.user?.id
		});

		await markOrderPaid(order._id, { amountCharged: 0, currency: 'GBP' });

		// Build the permanent download links, same as a paid order.
		const magazineFiles = await getMagazineDownloadFiles(items.map((item) => item.id));

		const downloadLinks = magazineFiles
			.filter(
				(product: { digitalFile?: { asset?: { _ref: string } } }) =>
					product.digitalFile?.asset?._ref
			)
			.map((product: { title: string; digitalFile: { asset: { _ref: string } } }) => ({
				title: product.title,
				url: sanityFileUrl(product.digitalFile.asset._ref)
			}));

		try {
			await sendStoreOrderConfirmationEmails({
				name,
				email,
				orderId: order._id,
				items,
				subtotal: 0,
				amountCharged: 0,
				currency: 'GBP',
				paymentMethod: 'free',
				shipping: null,
				downloadLinks
			});

			await markOrderEmailSent(order._id);
		} catch (emailError) {
			// The order is saved and paid. Logged-in users can still download
			// from My Bookings, so don't fail the whole request.
			console.error(`Free order ${order._id}: confirmation email failed:`, emailError);
		}

		return json({ orderId: order._id });
	} catch (error) {
		console.error('Free store order failed:', error);
		return json({ error: 'Could not complete your order. Please try again.' }, { status: 500 });
	}
};