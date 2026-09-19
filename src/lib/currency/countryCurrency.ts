export interface CurrencyInfo {
	code: string; // ISO 4217, e.g. 'NGN'
	symbol: string;
}

// Country code (ISO 3166-1 alpha-2) -> currency
export const countryToCurrency: Record<string, CurrencyInfo> = {
	NG: { code: 'NGN', symbol: '₦' },
	GH: { code: 'GHS', symbol: '₵' },
	KE: { code: 'KES', symbol: 'KSh' },
	TZ: { code: 'TZS', symbol: 'TSh' },
	RW: { code: 'RWF', symbol: 'FRw' },
	EG: { code: 'EGP', symbol: 'E£' },
	MA: { code: 'MAD', symbol: 'DH' },
	ZA: { code: 'ZAR', symbol: 'R' },
	GB: { code: 'GBP', symbol: '£' },
	US: { code: 'USD', symbol: '$' },
	CA: { code: 'CAD', symbol: 'CA$' },
	AU: { code: 'AUD', symbol: 'A$' },
	DE: { code: 'EUR', symbol: '€' },
	FR: { code: 'EUR', symbol: '€' },
	ES: { code: 'EUR', symbol: '€' },
	IT: { code: 'EUR', symbol: '€' }
};

export const BASE_CURRENCY: CurrencyInfo = { code: 'GBP', symbol: '£' };

export function currencyForCountry(countryCode: string | undefined): CurrencyInfo {
	if (!countryCode) return BASE_CURRENCY;
	return countryToCurrency[countryCode.toUpperCase()] ?? BASE_CURRENCY;
}