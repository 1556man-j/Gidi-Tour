import { env } from '$env/dynamic/private';

// dLocal is used only where it can charge in the customer's LOCAL currency
// (these are the countries Gidi Tour converts prices for). Everyone else pays by
// Stripe in GBP, which Stripe accepts from customers in almost any country.
//
// To change the list without a code change, set DLOCAL_COUNTRIES to a comma
// separated list, for example: NG,GH,KE
const DEFAULT_DLOCAL_COUNTRIES = ['NG', 'GH', 'KE', 'TZ', 'RW', 'EG', 'MA', 'ZA'];

function dlocalCountries(): Set<string> {
	const configured = env.DLOCAL_COUNTRIES;

	const list = configured
		? configured
				.split(',')
				.map((c) => c.trim().toUpperCase())
				.filter(Boolean)
		: DEFAULT_DLOCAL_COUNTRIES;

	return new Set(list);
}

export function isDlocalCountry(countryCode: string | undefined | null): boolean {
	return !!countryCode && dlocalCountries().has(countryCode.toUpperCase());
}

export function getPaymentProvider(countryCode: string | undefined): 'stripe' | 'dlocal' {
	return isDlocalCountry(countryCode) ? 'dlocal' : 'stripe';
}

/** A valid 2 letter country code from the visitor_country cookie, or GB. */
export function safeCountry(value: string | undefined | null): string {
	const code = (value ?? '').trim().toUpperCase();
	return /^[A-Z]{2}$/.test(code) ? code : 'GB';
}
