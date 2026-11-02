import { db, unwrap, fromRow } from '$lib/server/supabase';

// Limits and quick-pick amounts, in GBP. Change them here.
// The minimum is not too low on purpose: very small donations are what card-testing bots use.
export const MIN_DONATION_GBP = 3;
export const MAX_DONATION_GBP = 2500;
export const DONATION_PRESETS = [5, 10, 25, 50, 100];

export interface DonationInput {
	caseSlug?: string | null;
	name: string;
	email: string;
	message?: string;
	anonymous: boolean;
	amountGBP: number;
	convertedAmount: number;
	countryCode?: string;
	currencyCode: string;
	paymentMethod: 'stripe' | 'dlocal';
	customerId?: string;
}

export async function createPendingDonation(input: DonationInput) {
	const row = unwrap(
		await db
			.from('donations')
			.insert({
				case_slug: input.caseSlug || null,
				donor_name: input.name,
				email: input.email,
				message: input.message || null,
				anonymous: input.anonymous,
				amount_gbp: input.amountGBP,
				converted_amount: input.convertedAmount,
				country_code: input.countryCode ?? null,
				currency_code: input.currencyCode,
				payment_method: input.paymentMethod,
				payment_status: 'pending',
				customer_id: input.customerId ?? null
			})
			.select('id')
			.single()
	);

	return { _id: row.id as string };
}

export async function getDonationStatus(donationId: string) {
	const row = unwrap(await db.from('donations').select('*').eq('id', donationId).maybeSingle());
	return fromRow(row);
}

export interface GidiCareTotals {
	all: { total: number; supporters: number };
	byCase: Map<string, { total: number; supporters: number }>;
}

/** Paid donations only (refunded and failed ones are never counted). */
export async function getGidiCareTotals(): Promise<GidiCareTotals> {
	const rows = unwrap(await db.rpc('gidicare_totals')) as
		| { case_slug: string; total_gbp: number | string; supporters: number | string }[]
		| null;

	const byCase = new Map<string, { total: number; supporters: number }>();
	const all = { total: 0, supporters: 0 };

	for (const row of rows ?? []) {
		const total = Number(row.total_gbp) || 0;
		const supporters = Number(row.supporters) || 0;

		byCase.set(row.case_slug, { total, supporters });
		all.total += total;
		all.supporters += supporters;
	}

	return { all, byCase };
}

/** First names (or "Anonymous supporter") of the latest paid donors. No amounts, emails or messages. */
export async function getRecentSupporters(limit = 8): Promise<string[]> {
	const rows = unwrap(
		await db
			.from('donations')
			.select('donor_name, anonymous')
			.eq('payment_status', 'paid')
			.order('created_at', { ascending: false })
			.limit(limit)
	);

	return (rows ?? []).map((row) =>
		row.anonymous ? 'Anonymous supporter' : String(row.donor_name).trim().split(/\s+/)[0] || 'A supporter'
	);
}
