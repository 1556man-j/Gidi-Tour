import { json } from '@sveltejs/kit';
import { dlocalHeaders, DLOCAL_API_BASE } from '$lib/server/dlocalClient';
import { createPendingOrder } from '$lib/sanity/queries/storeOrder';
import type { RequestHandler } from '../$types';

export const POST: RequestHandler = async ({ request, url, locals }) => {
	const body = await request.json();
	const session = await locals.auth();

	if (!body.name || !body.email || !body.convertedAmount || !body.currencyCode) {
		return json({ error: 'Missing required order fields.' }, { status: 400 });
	}

	const hasMerchandise = (body.items ?? []).some(
		(item: { category?: string }) => item.category === 'merchandise'
	);

	if (hasMerchandise && !body.shipping) {
		return json({ error: 'Shipping details are required for this order.' }, { status: 400 });
	}

	const order = await createPendingOrder({
		...body,
		paymentMethod: 'dlocal',
		customerId: session?.user?.id
	});

	const payload = {
		amount: body.convertedAmount,
		currency: body.currencyCode,
		country: body.countryCode,

		payment_method_flow: 'REDIRECT',

		payer: {
			name: body.name,
			email: body.email
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
};
