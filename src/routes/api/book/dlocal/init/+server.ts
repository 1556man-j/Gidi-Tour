import { json } from '@sveltejs/kit';
import { dlocalHeaders, DLOCAL_API_BASE } from '$lib/server/dlocalClient';
import { createPendingBooking } from '$lib/sanity/queries/booking';
import { setDlocalPaymentId } from '$lib/server/paymentRecords';
import { buildVerifiedBooking, BookingValidationError } from '$lib/server/bookingPricing';
import type { RequestHandler } from './$types';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { safeCountry, isDlocalCountry } from '$lib/server/paymentRouter';

export const POST: RequestHandler = async ({ request, url, locals, cookies, getClientAddress }) => {
	if (await isRateLimited(`book-init:${ipOf(getClientAddress)}`, 20, 3600)) return tooManyRequests();

	try {
		const body = await request.json();

		// Get the logged-in customer from Auth.js
		const session = await locals.auth();
		const customerId = session?.user?.id;

		// Booking needs an account (the /book page already requires login).
		if (!customerId) {
			return json({ error: 'Please log in to complete your booking.' }, { status: 401 });
		}

		const countryCode = safeCountry(cookies.get('visitor_country'));

		if (!isDlocalCountry(countryCode)) {
			return json({ error: 'This payment method is not available in your country.' }, { status: 400 });
		}
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

		// Remember the dLocal payment, so the confirmation page can ask dLocal about it
		// if the webhook is late or never arrives.
		if (data.id) await setDlocalPaymentId('bookings', booking._id, data.id);

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