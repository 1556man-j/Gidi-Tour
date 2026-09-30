import { json } from '@sveltejs/kit';
import { dlocalHeaders, DLOCAL_API_BASE } from '$lib/server/dlocalClient';
import { createPendingBooking } from '$lib/sanity/queries/booking';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, url, locals }) => {
	const body = await request.json();

	if (!body.name || !body.email || !body.convertedAmount || !body.currencyCode) {
		return json({ error: 'Missing required booking fields.' }, { status: 400 });
	}

	// Get the logged-in customer from Auth.js
	const session = await locals.auth();
	const customerId = session?.user?.id;

	const booking = await createPendingBooking({
		...body,
		customerId,
		paymentMethod: 'dlocal'
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

		order_id: booking._id,

		notification_url: `${url.origin}/api/book/dlocal/webhook`,

		callback_url: `${url.origin}/api/book/dlocal/return?bookingId=${booking._id}`
	};

	const bodyString = JSON.stringify(payload);

	const res = await fetch(`${DLOCAL_API_BASE}/payments`, {
		method: 'POST',
		headers: dlocalHeaders(bodyString),
		body: bodyString
	});

	const data = await res.json();

	if (!res.ok) {
		console.error('dLocal payment creation failed:', data);

		return json(
			{ error: 'Could not start payment.' },
			{ status: 502 }
		);
	}

	return json({
		redirectUrl: data.redirect_url,
		bookingId: booking._id
	});
};