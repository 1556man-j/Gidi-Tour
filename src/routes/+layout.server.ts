import { getSiteSettings } from '$lib/sanity/queries/siteSettings';
import { detectCountryFromIp, getVisitorCurrency } from '$lib/server/geoCurrency';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, getClientAddress }) => {
	const siteSettings = await getSiteSettings();

	let countryCode = cookies.get('visitor_country');

	if (!countryCode) {
		const ip = getClientAddress();
		countryCode = (await detectCountryFromIp(ip)) ?? 'GB'; // default to base currency's country
		cookies.set('visitor_country', countryCode, { path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
	}

	const { currency, rate } = await getVisitorCurrency(countryCode);

	return { siteSettings, currency, rate };
};