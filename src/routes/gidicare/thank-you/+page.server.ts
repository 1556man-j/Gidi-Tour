import { error } from '@sveltejs/kit';
import { getDonationStatus } from '$lib/server/donations';
import { reconcileDlocalDonation } from '$lib/server/paymentSettlement';
import { getGidiCareCaseTitle } from '$lib/sanity/queries/gidicare';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const donationId = url.searchParams.get('donationId');

	if (!donationId) {
		throw error(400, 'Missing donation reference.');
	}

	let donation = await getDonationStatus(donationId);

	if (!donation) {
		throw error(404, 'Donation not found.');
	}

	// If dLocal sent the donor back before its confirmation arrived, ask dLocal directly.
	// Coming back to the site never marks anything as paid by itself.
	donation = await reconcileDlocalDonation(donation);

	const caseTitle = donation.caseSlug ? await getGidiCareCaseTitle(donation.caseSlug) : undefined;

	// Only what this page shows. No email, message or other private fields.
	return {
		donationId,
		donation: {
			firstName: String(donation.donorName ?? '').trim().split(/\s+/)[0] || '',
			paymentStatus: donation.paymentStatus,
			amountGBP: Number(donation.amountGBP ?? 0),
			amountCharged: donation.amountCharged,
			currency: donation.currency,
			caseSlug: donation.caseSlug,
			caseTitle
		}
	};
};
