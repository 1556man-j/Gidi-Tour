import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { createPendingOrder } from '$lib/sanity/queries/storeOrder';
import type { RequestHandler } from '../$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		if (!body.name || !body.email || !Array.isArray(body.items) || body.items.length === 0) {
			return json({ error: 'Missing required order fields.' }, { status: 400 });
		}

		if (typeof body.subtotal !== 'number' || typeof body.convertedAmount !== 'number') {
			return json({ error: 'Invalid order amount.' }, { status: 400 });
		}

		if (body.convertedAmount <= 0) {
			return json({ error: 'Order amount must be greater than zero.' }, { status: 400 });
		}

		const hasMerchandise = body.items.some(
			(item: { category?: string }) => item.category === 'merchandise'
		);

		if (hasMerchandise && !body.shipping) {
			return json({ error: 'Shipping details are required for this order.' }, { status: 400 });
		}

		// NOTE: as with the booking flow, this trusts the client-computed subtotal/
		// convertedAmount rather than re-pricing items from Sanity. Worth tightening
		// later by re-fetching each item's price by slug before charging.

		const order = await createPendingOrder({
			items: body.items,
			subtotal: body.subtotal,
			name: body.name.trim(),
			email: body.email.trim().toLowerCase(),
			shipping: body.shipping ?? null,
			convertedAmount: body.convertedAmount,
			currencyCode: body.currencyCode?.toLowerCase(),
			paymentMethod: 'stripe'
		});

		console.log('Created pending store order:', order._id);

		const amountInMinorUnits = Math.round(body.convertedAmount * 100);

		if (amountInMinorUnits <= 0) {
			return json({ error: 'Invalid Stripe payment amount.' }, { status: 400 });
		}

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInMinorUnits,
			currency: body.currencyCode.toLowerCase(),

			metadata: {
				orderId: order._id
			},

			automatic_payment_methods: {
				enabled: true,
				allow_redirects: 'always'
			},

			receipt_email: body.email.trim().toLowerCase()
		});

		console.log('Created Stripe PaymentIntent:', paymentIntent.id);
		console.log('Order ID:', order._id);

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