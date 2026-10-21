import { BASE_CURRENCY } from '$lib/currency/countryCurrency';
import { getVisitorCurrency } from '$lib/server/geoCurrency';

/**
 * Works out the currency and amount to charge for a GBP total.
 *
 * If the exchange rate is missing or invalid, this falls back to GBP so the
 * customer is never charged a GBP number in a different currency
 * (for example £150 charged as ₦150).
 */
export async function getChargeAmount(totalGBP: number, countryCode: string | undefined) {
	const { currency, rate } = await getVisitorCurrency(countryCode);

	const rateIsUsable = rate !== null && Number.isFinite(rate) && rate > 0;

	if (!rateIsUsable) {
		return {
			currencyCode: BASE_CURRENCY.code, // 'GBP'
			convertedAmount: Math.round(totalGBP * 100) / 100,
			usedFallback: currency.code !== BASE_CURRENCY.code
		};
	}

	const currencyCode = currency.code.toUpperCase();

	return {
		currencyCode,
		// GBP is charged to the penny, exactly what the page showed (£149.50 stays £149.50).
		// Other currencies are whole units, matching how Price.svelte shows them.
		convertedAmount:
			currencyCode === BASE_CURRENCY.code
				? Math.round(totalGBP * 100) / 100
				: Math.round(totalGBP * rate),
		usedFallback: false
	};
}
