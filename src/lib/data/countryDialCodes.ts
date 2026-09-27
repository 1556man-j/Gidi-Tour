export interface CountryDialCode {
	name: string;
	code: string; // ISO 3166-1 alpha-2
	dialCode: string;
}

export const countryDialCodes: CountryDialCode[] = [
	{ name: 'Nigeria', code: 'NG', dialCode: '+234' },
	{ name: 'Ghana', code: 'GH', dialCode: '+233' },
	{ name: 'Kenya', code: 'KE', dialCode: '+254' },
	{ name: 'Tanzania', code: 'TZ', dialCode: '+255' },
	{ name: 'Rwanda', code: 'RW', dialCode: '+250' },
	{ name: 'Egypt', code: 'EG', dialCode: '+20' },
	{ name: 'Morocco', code: 'MA', dialCode: '+212' },
	{ name: 'South Africa', code: 'ZA', dialCode: '+27' },
	{ name: 'United Kingdom', code: 'GB', dialCode: '+44' },
	{ name: 'United States', code: 'US', dialCode: '+1' },
	{ name: 'Canada', code: 'CA', dialCode: '+1' },
	{ name: 'Australia', code: 'AU', dialCode: '+61' },
	{ name: 'Germany', code: 'DE', dialCode: '+49' },
	{ name: 'France', code: 'FR', dialCode: '+33' },
	{ name: 'Spain', code: 'ES', dialCode: '+34' },
	{ name: 'Italy', code: 'IT', dialCode: '+39' }
];