import { BASE_CURRENCY, currencyForCountry, type CurrencyInfo } from '$lib/currency/countryCurrency';

interface RatesCache {
	rates: Record<string, number>;
	fetchedAt: number;
}

let ratesCache: RatesCache | null = null;
const CACHE_DURATION_MS = 1000 * 60 * 60 * 6; // 6 hours

async function getExchangeRates(): Promise<Record<string, number>> {
	const now = Date.now();
	if (ratesCache && now - ratesCache.fetchedAt < CACHE_DURATION_MS) {
		return ratesCache.rates;
	}

	try {
		const res = await fetch(`https://api.frankfurter.app/latest?from=${BASE_CURRENCY.code}`);
		if (!res.ok) throw new Error('Rate fetch failed');
		const data = await res.json();
		ratesCache = { rates: data.rates, fetchedAt: now };
		return data.rates;
	} catch (err) {
		console.error('Failed to fetch exchange rates:', err);
		// Fall back to whatever we had before, or empty (no conversion) if nothing cached yet
		return ratesCache?.rates ?? {};
	}
}

export async function detectCountryFromIp(ip: string): Promise<string | undefined> {
	// Skip lookup for local/dev IPs
	if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')) {
		return undefined;
	}

	try {
		const res = await fetch(`https://ipwho.is/${ip}`);
		if (!res.ok) return undefined;
		const data = await res.json();
		return data.success ? data.country_code : undefined;
	} catch (err) {
		console.error('Geolocation lookup failed:', err);
		return undefined;
	}
}

export async function getVisitorCurrency(countryCode: string | undefined): Promise<{
	currency: CurrencyInfo;
	rate: number | null; // null means conversion unavailable, only show base price
}> {
	const currency = currencyForCountry(countryCode);

	if (currency.code === BASE_CURRENCY.code) {
		return { currency, rate: 1 };
	}

	const rates = await getExchangeRates();
	const rate = rates[currency.code] ?? null;

	return { currency, rate };
}