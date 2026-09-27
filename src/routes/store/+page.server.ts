import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getStoreProducts } from '$lib/sanity/queries/store';
import { getPaymentProvider } from '$lib/server/paymentRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent(); // currency, rate, countryCode, siteSettings

	const [pageSeo, storeProducts] = await Promise.all([
		getPageSeo('store'), // create a matching "store" pageSeo doc in Sanity, or drop this line
		getStoreProducts()
	]);

	const paymentProvider = getPaymentProvider(parentData.countryCode);

	return { pageSeo, storeProducts, paymentProvider };
};