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

	const COOKIE_OPTIONS = { path: '/', maxAge: 60 * 60 * 24 * 30 } as const;

	// Version marker. Country cookies saved before this existed (for example from old
	// ?country= tests) have no marker, so they are ignored once and the country is
	// worked out again from the visitor's IP. Change the number to force that again.
	const COOKIE_VERSION = '2';

	let countryCode: string | undefined = cookies.get('visitor_country');

	if (
		cookies.get('visitor_country_v') !== COOKIE_VERSION ||
		(countryCode && !/^[A-Z]{2}$/.test(countryCode))
	) {
		countryCode = undefined;
	}

	// Test override: development only. In production the country always comes
	// from the visitor's IP, so nobody can pick their own currency or provider.
	const testCountry = dev ? url.searchParams.get('country') : null;

	if (testCountry && /^[a-zA-Z]{2}$/.test(testCountry)) {
		countryCode = testCountry.toUpperCase();
		cookies.set('visitor_country', countryCode, COOKIE_OPTIONS);
		cookies.set('visitor_country_v', COOKIE_VERSION, COOKIE_OPTIONS);
	}

	if (!countryCode) {
		const detected = await detectCountryFromIp(getClientAddress());

		countryCode = detected ?? 'GB';

		// Only remember a real detection. If the lookup failed, GB is used for this
		// page only and the lookup is tried again next time.
		if (detected) {
			cookies.set('visitor_country', countryCode, COOKIE_OPTIONS);
			cookies.set('visitor_country_v', COOKIE_VERSION, COOKIE_OPTIONS);
		}
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
