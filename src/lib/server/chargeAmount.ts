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
			convertedAmount: Math.round(totalGBP),
			usedFallback: currency.code !== BASE_CURRENCY.code
		};
	}

	return {
		currencyCode: currency.code.toUpperCase(),
		convertedAmount: Math.round(totalGBP * rate),
		usedFallback: false
	};
}
