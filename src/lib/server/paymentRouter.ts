// Countries where Stripe has strong native card + Apple/Google Pay support.
const STRIPE_COUNTRIES = new Set([
	'GB', 'US', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'IE', 'NZ'
]);

export function getPaymentProvider(countryCode: string | undefined): 'stripe' | 'dlocal' {
	if (!countryCode) return 'stripe';
	return STRIPE_COUNTRIES.has(countryCode.toUpperCase()) ? 'stripe' : 'dlocal';
}