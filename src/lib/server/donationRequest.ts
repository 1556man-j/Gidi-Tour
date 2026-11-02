import { getChargeAmount } from '$lib/server/chargeAmount';
import { getVisitorCurrency } from '$lib/server/geoCurrency';
import { getGidiCareCaseStatus } from '$lib/sanity/queries/gidicare';
import {
	DONATION_PRESETS,
	MIN_DONATION_GBP,
	MAX_DONATION_GBP
} from '$lib/server/donations';

export class DonationRequestError extends Error {}

export interface ParsedDonation {
	name: string;
	email: string;
	message?: string;
	anonymous: boolean;
	caseSlug: string | null;
	amountGBP: number;
	convertedAmount: number;
	currencyCode: string;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Validates the request and works out the real amount ON THE SERVER.
 *
 * - A quick-pick amount is a GBP preset, converted like every other price on the site.
 * - A custom amount is typed in the visitor's own currency (for example naira) and is
 *   charged exactly as typed. Its GBP value is worked out for the limits and the totals.
 */
export async function parseDonation(body: any, countryCode: string): Promise<ParsedDonation> {
	const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : '';
	const email =
		typeof body?.email === 'string' ? body.email.trim().toLowerCase().slice(0, 200) : '';

	if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new DonationRequestError('Please enter your name and a valid email address.');
	}

	const message =
		typeof body?.message === 'string' && body.message.trim()
			? body.message.trim().slice(0, 300)
			: undefined;

	// A case must exist and still be collecting donations.
	let caseSlug: string | null = null;

	if (typeof body?.caseSlug === 'string' && body.caseSlug.trim()) {
		const found = await getGidiCareCaseStatus(body.caseSlug.trim());

		if (!found || found.status !== 'active') {
			throw new DonationRequestError('This animal is no longer collecting donations.');
		}

		caseSlug = body.caseSlug.trim();
	}

	const { currency, rate } = await getVisitorCurrency(countryCode);
	const rateUsable = rate !== null && Number.isFinite(rate) && rate > 0;
	const isGBP = !rateUsable || currency.code.toUpperCase() === 'GBP';

	let amountGBP: number;
	let convertedAmount: number;
	let currencyCode: string;

	if (typeof body?.preset === 'number' && DONATION_PRESETS.includes(body.preset)) {
		amountGBP = body.preset;
		({ currencyCode, convertedAmount } = await getChargeAmount(amountGBP, countryCode));
	} else if (typeof body?.customAmount === 'number' && Number.isFinite(body.customAmount)) {
		if (isGBP) {
			amountGBP = round2(body.customAmount);
			convertedAmount = amountGBP;
			currencyCode = 'GBP';
		} else {
			convertedAmount = Math.round(body.customAmount);
			amountGBP = round2(convertedAmount / (rate as number));
			currencyCode = currency.code.toUpperCase();
		}
	} else {
		throw new DonationRequestError('Please choose an amount.');
	}

	if (amountGBP < MIN_DONATION_GBP || amountGBP > MAX_DONATION_GBP || convertedAmount <= 0) {
		throw new DonationRequestError('That amount is outside what we can accept online.');
	}

	return {
		name,
		email,
		message,
		anonymous: body?.anonymous === true,
		caseSlug,
		amountGBP,
		convertedAmount,
		currencyCode
	};
}
