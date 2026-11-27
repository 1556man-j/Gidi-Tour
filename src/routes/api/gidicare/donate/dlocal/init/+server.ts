import { json } from '@sveltejs/kit';
import { dlocalHeaders, DLOCAL_API_BASE, logDlocalFailure } from '$lib/server/dlocalClient';
import { createPendingDonation } from '$lib/server/donations';
import { parseDonation, DonationRequestError } from '$lib/server/donationRequest';
import { setDlocalPaymentId } from '$lib/server/paymentRecords';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { safeCountry, isDlocalCountry } from '$lib/server/paymentRouter';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url, locals, cookies, getClientAddress }) => {
	if (await isRateLimited(`gidicare-init:${ipOf(getClientAddress)}`, 10, 3600)) {
		return tooManyRequests();
	}

	try {
		const body = await request.json();
		const session = await locals.auth();
		const countryCode = safeCountry(cookies.get('visitor_country'));

		if (!isDlocalCountry(countryCode)) {
			return json({ error: 'This payment method is not available in your country.' }, { status: 400 });
		}

		const donation = await parseDonation(body, countryCode);

		const record = await createPendingDonation({
			caseSlug: donation.caseSlug,
			name: donation.name,
			email: donation.email,
			message: donation.message,
			anonymous: donation.anonymous,
			amountGBP: donation.amountGBP,
			convertedAmount: donation.convertedAmount,
			countryCode,
			currencyCode: donation.currencyCode.toUpperCase(),
			paymentMethod: 'dlocal',
			customerId: session?.user?.id
		});

		const payload = {
			amount: donation.convertedAmount,
			currency: donation.currencyCode.toUpperCase(),
			country: countryCode,

			payment_method_flow: 'REDIRECT',

			payer: {
				name: donation.name,
				email: donation.email
			},

			order_id: record._id,

			notification_url: `${url.origin}/api/gidicare/dlocal/webhook`,

			callback_url: `${url.origin}/api/gidicare/dlocal/return?donationId=${record._id}`
		};
		const bodyString = JSON.stringify(payload);

		const res = await fetch(`${DLOCAL_API_BASE}/payments`, {
			method: 'POST',
			headers: dlocalHeaders(bodyString),
			body: bodyString
		});

		const data = await res.json();

		if (!res.ok) {
			logDlocalFailure('dLocal GidiCare payment creation failed', data);
			return json({ error: 'Could not start payment.' }, { status: 502 });
		}

		if (data.id) await setDlocalPaymentId('donations', record._id, data.id);

		return json({ redirectUrl: data.redirect_url, donationId: record._id });
	} catch (error) {
		if (error instanceof DonationRequestError) {
			return json({ error: error.message }, { status: 400 });
		}

		console.error('dLocal GidiCare initialization failed:', error);
		return json({ error: 'Could not start your donation. Please try again.' }, { status: 500 });
	}
};
