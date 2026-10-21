import { json } from '@sveltejs/kit';
import { getSiteSettings } from '$lib/sanity/queries/siteSettings';
import { getVisitorCurrency } from '$lib/server/geoCurrency';
import { getPaymentProvider, safeCountry } from '$lib/server/paymentRouter';
import { getCustomerProfile } from '$lib/sanity/queries/customer';
import type { RequestHandler } from './$types';

// One call the app makes at launch: country, currency, rate, payment provider, contact details, profile.
export const GET: RequestHandler = async ({ locals, cookies }) => {
	const countryCode = safeCountry(cookies.get('visitor_country'));
	const [{ currency, rate }, siteSettings, session] = await Promise.all([
		getVisitorCurrency(countryCode),
		getSiteSettings(),
		locals.auth()
	]);
	const customer = session?.user?.id ? await getCustomerProfile(session.user.id) : null;

	return json({
		countryCode,
		currency,
		rate,
		paymentProvider: getPaymentProvider(countryCode),
		siteSettings,
		customer: customer ? { ...customer, _id: session!.user!.id } : null
	});
};
