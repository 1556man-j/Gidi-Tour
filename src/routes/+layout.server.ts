import { getSiteSettings } from '$lib/sanity/queries/siteSettings';
import { detectCountryFromIp, getVisitorCurrency } from '$lib/server/geoCurrency';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, getClientAddress, url }) => {
	const siteSettings = await getSiteSettings();

	let countryCode = cookies.get('visitor_country');

	// Development/testing override:
	// Example: http://localhost:5173/?country=NG
	const testCountry = url.searchParams.get('country');

	if (testCountry) {
		countryCode = testCountry.toUpperCase();

		cookies.set('visitor_country', countryCode, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30
		});
	}

	if (!countryCode) {
		const ip = getClientAddress();

		countryCode = (await detectCountryFromIp(ip)) ?? 'GB';

		cookies.set('visitor_country', countryCode, {
			path: '/',
			maxAge: 60 * 60 * 24 * 30
		});
	}

	const { currency, rate } = await getVisitorCurrency(countryCode);

	return {
		siteSettings,
		currency,
		rate,
		countryCode
	};
};