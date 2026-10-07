import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { createPendingOrder, type StoreOrderItemInput } from '$lib/sanity/queries/storeOrder';
import { getStoreProducts } from '$lib/sanity/queries/store';
import { getVisitorCurrency } from '$lib/server/geoCurrency';
import type { RequestHandler } from './$types';
import { effectivePrice } from '$lib/storePricing';

// PayPal on Stripe only works for some currencies. For any other currency
// the customer still gets card, Apple Pay and Google Pay.
// Check the current list in the Stripe docs and edit this if needed.
const PAYPAL_CURRENCIES = [
	'aud',
	'cad',
	'chf',
	'czk',
	'dkk',
	'eur',
	'gbp',
	'nok',
	'nzd',
	'pln',
	'sek',
	'usd'
];

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const body = await request.json();
		const session = await locals.auth();

		if (
			!body.name?.trim() ||
			!body.email?.trim() ||
			!Array.isArray(body.items) ||
			body.items.length === 0
		) {
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

			const quantity = product.category === 'magazine' ? 1 : Math.floor(Number(raw.quantity));

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
			return json({ error: 'Order amount must be greater than zero.' }, { status: 400 });
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

		const currencyCode = currency.code.toLowerCase();
		const convertedAmount = rate !== null ? Math.round(subtotal * rate) : subtotal;

		const amountInMinorUnits = Math.round(convertedAmount * 100);

		if (amountInMinorUnits <= 0) {
			return json({ error: 'Invalid Stripe payment amount.' }, { status: 400 });
		}

		// ------------------------------------------------------------
		// Save the pending order
		// ------------------------------------------------------------
		const customerId = session?.user?.id;

		const order = await createPendingOrder({
			items,
			subtotal,
			name: body.name.trim(),
			email: body.email.trim().toLowerCase(),
			shipping,
			convertedAmount,
			countryCode,
			currencyCode,
			paymentMethod: 'stripe',
			customerId
		});

		console.log('Created pending store order:', order._id);

		// ------------------------------------------------------------
		// Create the Stripe PaymentIntent
		// ------------------------------------------------------------
		const paymentMethodTypes = PAYPAL_CURRENCIES.includes(currencyCode)
			? ['card', 'paypal']
			: ['card'];

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInMinorUnits,
			currency: currencyCode,

			metadata: {
				orderId: order._id,
				customerId: customerId ?? ''
			},

			payment_method_types: paymentMethodTypes,

			receipt_email: body.email.trim().toLowerCase()
		});

		console.log('Created Stripe PaymentIntent:', paymentIntent.id);

		return json({
			clientSecret: paymentIntent.client_secret,
			orderId: order._id,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		console.error('Stripe store checkout initialization failed:', error);

		return json(
			{
				error: 'Could not start your payment. Please try again.'
			},
			{ status: 500 }
		);
	}
};
