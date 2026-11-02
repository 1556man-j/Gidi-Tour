import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { createPendingDonation } from '$lib/server/donations';
import { parseDonation, DonationRequestError } from '$lib/server/donationRequest';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { safeCountry } from '$lib/server/paymentRouter';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, cookies, getClientAddress }) => {
	// Donation pages attract card-testing bots, so this is limited tightly.
	if (await isRateLimited(`gidicare-init:${ipOf(getClientAddress)}`, 10, 3600)) {
		return tooManyRequests();
	}

	try {
		const body = await request.json();
		const session = await locals.auth();
		const countryCode = safeCountry(cookies.get('visitor_country'));

		const donation = await parseDonation(body, countryCode);

		const amountInMinorUnits = Math.round(donation.convertedAmount * 100);

		if (amountInMinorUnits <= 0) {
			return json({ error: 'Invalid payment amount.' }, { status: 400 });
		}

		const record = await createPendingDonation({
			caseSlug: donation.caseSlug,
			name: donation.name,
			email: donation.email,
			message: donation.message,
			anonymous: donation.anonymous,
			amountGBP: donation.amountGBP,
			convertedAmount: donation.convertedAmount,
			countryCode,
			currencyCode: donation.currencyCode.toLowerCase(),
			paymentMethod: 'stripe',
			customerId: session?.user?.id
		});

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInMinorUnits,
			currency: donation.currencyCode.toLowerCase(),
			description: donation.caseSlug ? `GidiCare donation (${donation.caseSlug})` : 'GidiCare donation',
			metadata: { donationId: record._id, caseSlug: donation.caseSlug ?? '' },

			// Offers whatever is switched on in the Stripe dashboard (cards, Apple Pay,
			// Google Pay, PayPal...).
			automatic_payment_methods: { enabled: true },

			receipt_email: donation.email
		});

		return json({
			clientSecret: paymentIntent.client_secret,
			donationId: record._id
		});
	} catch (error) {
		if (error instanceof DonationRequestError) {
			return json({ error: error.message }, { status: 400 });
		}

		console.error('GidiCare Stripe initialization failed:', error);
		return json({ error: 'Could not start your donation. Please try again.' }, { status: 500 });
	}
};
