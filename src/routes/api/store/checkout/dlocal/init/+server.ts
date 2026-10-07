import { json } from '@sveltejs/kit';
import { dlocalHeaders, DLOCAL_API_BASE } from '$lib/server/dlocalClient';
import { createPendingOrder, type StoreOrderItemInput } from '$lib/sanity/queries/storeOrder';
import { getStoreProducts } from '$lib/sanity/queries/store';
import { getVisitorCurrency } from '$lib/server/geoCurrency';
import { effectivePrice } from '$lib/storePricing';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url, locals, cookies }) => {
	try {
		const body = await request.json();
		const session = await locals.auth();

		const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
		const email =
			typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';

		if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return json({ error: 'Please enter a valid name and email.' }, { status: 400 });
		}

		if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) {
			return json({ error: 'Missing required order fields.' }, { status: 400 });
		}

		// ------------------------------------------------------------
		// Re-price every item from Sanity. Prices, titles and categories
		// sent by the browser are ignored.
		// ------------------------------------------------------------
		const products = await getStoreProducts();
		const productBySlug = new Map(products.map((p) => [p.slug.current, p]));

		const items: StoreOrderItemInput[] = [];

		for (const raw of body.items) {
			const product = productBySlug.get(raw?.id);

			if (!product) {
				return json(
					{ error: 'One of the items in your cart is no longer available.' },
					{ status: 400 }
				);
			}

			const quantity =
				product.category === 'magazine' ? 1 : Math.floor(Number(raw.quantity));

			if (!Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
				return json({ error: 'Invalid item quantity.' }, { status: 400 });
			}

			items.push({
				id: product.slug.current,
				category: product.category,
				title: product.title,
				price: effectivePrice(product),
				quantity,
				variant: typeof raw.variant === 'string' ? raw.variant : undefined
			});
		}

		const subtotal =
			Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;

		if (subtotal <= 0) {
			return json(
				{ error: 'This order is free, so no payment is needed.' },
				{ status: 400 }
			);
		}

		// ------------------------------------------------------------
		// Shipping (only needed for merchandise)
		// ------------------------------------------------------------
		const hasMerchandise = items.some((item) => item.category === 'merchandise');

		let shipping: { address: string; city: string; country: string; postcode: string } | null =
			null;

		if (hasMerchandise) {
			const s = body.shipping;
			if (!s?.address?.trim() || !s?.city?.trim() || !s?.country?.trim() || !s?.postcode?.trim()) {
				return json({ error: 'Shipping details are required for this order.' }, { status: 400 });
			}
			shipping = {
				address: s.address.trim(),
				city: s.city.trim(),
				country: s.country.trim(),
				postcode: s.postcode.trim()
			};
		}

		// ------------------------------------------------------------
		// Currency and converted amount, worked out on the server
		// (same source and same rounding as the page the customer saw)
		// ------------------------------------------------------------
		const countryCode = cookies.get('visitor_country') ?? 'GB';
		const { currency, rate } = await getVisitorCurrency(countryCode);

		const currencyCode = currency.code.toUpperCase();
		const convertedAmount = rate !== null ? Math.round(subtotal * rate) : subtotal;

		if (convertedAmount <= 0) {
			return json({ error: 'Invalid payment amount.' }, { status: 400 });
		}

		// ------------------------------------------------------------
		// Save the pending order, then create the dLocal payment
		// ------------------------------------------------------------
		const order = await createPendingOrder({
			items,
			subtotal,
			name,
			email,
			shipping,
			convertedAmount,
			countryCode,
			currencyCode,
			paymentMethod: 'dlocal',
			customerId: session?.user?.id
		});

		const payload = {
			amount: convertedAmount,
			currency: currencyCode,
			country: countryCode,

			payment_method_flow: 'REDIRECT',

			payer: {
				name,
				email
			},

			order_id: order._id,

			notification_url: `${url.origin}/api/store/checkout/dlocal/webhook`,

			callback_url: `${url.origin}/api/store/checkout/dlocal/return?orderId=${order._id}`
		};
		const bodyString = JSON.stringify(payload);

		const res = await fetch(`${DLOCAL_API_BASE}/payments`, {
			method: 'POST',
			headers: dlocalHeaders(bodyString),
			body: bodyString
		});

		const data = await res.json();

		if (!res.ok) {
			console.error('dLocal store payment creation failed:', data);
			return json({ error: 'Could not start payment.' }, { status: 502 });
		}

		return json({ redirectUrl: data.redirect_url, orderId: order._id });
	} catch (error) {
		console.error('dLocal store checkout initialization failed:', error);
		return json({ error: 'Could not start your payment. Please try again.' }, { status: 500 });
	}
};