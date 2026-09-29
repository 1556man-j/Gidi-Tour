import { getSiteSettings } from '$lib/sanity/queries/siteSettings';
import { detectCountryFromIp, getVisitorCurrency } from '$lib/server/geoCurrency';
import type { LayoutServerLoad } from './$types';
import { getPaymentProvider } from '$lib/server/paymentRouter';
import { getCustomerProfile } from '$lib/sanity/queries/customer';
import { urlFor } from '$lib/sanity/client';

export const load: LayoutServerLoad = async (event) => {
	const { cookies, getClientAddress, url } = event;

	const siteSettings = await getSiteSettings();
	const session = await event.locals.auth();

	let countryCode = cookies.get('visitor_country');

	const testCountry = url.searchParams.get('country');

	if (testCountry) {
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
				avatarUrl: profile.avatar
					? urlFor(profile.avatar).width(160).height(160).fit('crop').url()
					: null
			};
		}
	}

	return { siteSettings, currency, rate, countryCode, session, paymentProvider, customer };
};
