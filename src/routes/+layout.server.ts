import { getSiteSettings } from '$lib/sanity/queries/siteSettings';
import { detectCountryFromIp, getVisitorCurrency } from '$lib/server/geoCurrency';
import type { LayoutServerLoad } from './$types';
import { dev } from '$app/environment';
import { getPaymentProvider } from '$lib/server/paymentRouter';
import { getCustomerProfile } from '$lib/sanity/queries/customer';

export const load: LayoutServerLoad = async (event) => {
	const { cookies, getClientAddress, url } = event;

	const siteSettings = await getSiteSettings();
	const session = await event.locals.auth();

	let countryCode = cookies.get('visitor_country');

	if (countryCode && !/^[A-Z]{2}$/.test(countryCode)) countryCode = undefined;

	// Test override: development only. In production the country always comes
	// from the visitor's IP, so nobody can pick their own currency or provider.
	const testCountry = dev ? url.searchParams.get('country') : null;

	if (testCountry && /^[a-zA-Z]{2}$/.test(testCountry)) {
		countryCode = testCountry.toUpperCase();
		cookies.set('visitor_country', countryCode, { path: '/', maxAge: 60 * 60 * 24 * 30 });
	}

	if (!countryCode) {
		const ip = getClientAddress();
		countryCode = (await detectCountryFromIp(ip)) ?? 'GB';
		cookies.set('visitor_country', countryCode, { path: '/', maxAge: 60 * 60 * 24 * 30 });
	}

	const { currency, rate } = await getVisitorCurrency(countryCode);

	const paymentProvider = getPaymentProvider(countryCode);

	let customer = null;
	if (session?.user?.id) {
		const profile = await getCustomerProfile(session.user.id);
		if (profile) {
			customer = {
				...profile,
				avatarUrl: profile.avatarUrl ? `${profile.avatarUrl}?w=160&h=160&fit=crop` : null
			};
		}
	}

	return { siteSettings, currency, rate, countryCode, session, paymentProvider, customer };
};
