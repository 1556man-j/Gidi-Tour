import {
	BASE_CURRENCY,
	currencyForCountry,
	type CurrencyInfo
} from '$lib/currency/countryCurrency';

interface RatesCache {
	rates: Record<string, number>;
	fetchedAt: number;
}

interface ExchangeRateApiResponse {
	result: string;
	base_code?: string;
	rates?: Record<string, number>;
}

let ratesCache: RatesCache | null = null;

// Cache exchange rates for 6 hours
const CACHE_DURATION_MS = 1000 * 60 * 60 * 6;

async function getExchangeRates(): Promise<Record<string, number>> {
	const now = Date.now();

	// Use cached rates if they are still valid
	if (ratesCache && now - ratesCache.fetchedAt < CACHE_DURATION_MS) {
		return ratesCache.rates;
	}

	try {
		const res = await fetch(
			`https://open.er-api.com/v6/latest/${BASE_CURRENCY.code}`,
			{
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!res.ok) {
			throw new Error(`Exchange rate request failed: ${res.status}`);
		}

		const data: ExchangeRateApiResponse = await res.json();

		if (data.result !== 'success' || !data.rates) {
			throw new Error('Invalid exchange rate API response');
		}

		ratesCache = {
			rates: data.rates,
			fetchedAt: now
		};

		return data.rates;
	} catch (err) {
		console.error('Failed to fetch exchange rates:', err);

		// Use previous cached rates if available
		return ratesCache?.rates ?? {};
	}
}

export async function detectCountryFromIp(
	ip: string
): Promise<string | undefined> {
	// Skip lookup for local/dev IPs
	if (
		!ip ||
		ip === '127.0.0.1' ||
		ip === '::1' ||
		ip.startsWith('192.168.')
	) {
		return undefined;
	}

	try {
		const res = await fetch(`https://ipwho.is/${ip}`);

		if (!res.ok) {
			return undefined;
		}

		const data = await res.json();

		return data.success ? data.country_code : undefined;
	} catch (err) {
		console.error('Geolocation lookup failed:', err);
		return undefined;
	}
}

export async function getVisitorCurrency(
	countryCode: string | undefined
): Promise<{
	currency: CurrencyInfo;
	rate: number | null;
}> {
	const currency = currencyForCountry(countryCode);

	// Base currency doesn't need conversion
	if (currency.code === BASE_CURRENCY.code) {
		return {
			currency,
			rate: 1
		};
	}

	const rates = await getExchangeRates();

	const rate = rates[currency.code] ?? null;

	return {
		currency,
		rate
	};
}