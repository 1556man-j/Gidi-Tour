import { json } from '@sveltejs/kit';
import { dlocalHeaders, DLOCAL_API_BASE } from '$lib/server/dlocalClient';
import { createPendingBooking } from '$lib/sanity/queries/booking';
import { buildVerifiedBooking, BookingValidationError } from '$lib/server/bookingPricing';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url, locals, cookies }) => {
	try {
		const body = await request.json();

		// Get the logged-in customer from Auth.js
		const session = await locals.auth();
		const customerId = session?.user?.id;

		const countryCode = cookies.get('visitor_country') ?? 'GB';
		const verified = await buildVerifiedBooking(body, countryCode);

		const booking = await createPendingBooking({
			...verified,
			customerId,
			paymentMethod: 'dlocal'
		});

		const payload = {
			amount: verified.convertedAmount,
			currency: verified.currencyCode,
			country: countryCode,

			payment_method_flow: 'REDIRECT',

			payer: {
				name: verified.name,
				email: verified.email
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

			return json({ error: 'Could not start payment.' }, { status: 502 });
		}

		return json({
			redirectUrl: data.redirect_url,
			bookingId: booking._id
		});
	} catch (error) {
		if (error instanceof BookingValidationError) {
			return json({ error: error.message }, { status: 400 });
		}

		console.error('dLocal booking initialization failed:', error);

		return json({ error: 'Could not start your payment. Please try again.' }, { status: 500 });
	}
};