import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import { getAllTours } from '$lib/sanity/queries/tours'; // use the same import as your tours page
import { getPaymentProvider } from '$lib/server/paymentRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();

	const [pageSeo, sanityFaqs, sanityTours] = await Promise.all([
		getPageSeo('book'),
		getFaqsForPage('book'),
		getAllTours()
	]);

	const paymentProvider = getPaymentProvider(parentData.countryCode);

	return { pageSeo, sanityFaqs, sanityTours, paymentProvider };
};