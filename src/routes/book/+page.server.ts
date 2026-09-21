import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import { getPaymentProvider } from '$lib/server/paymentRouter';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent(); // pulls countryCode, currency, rate from +layout.server.ts

	const [pageSeo, sanityFaqs] = await Promise.all([getPageSeo('book'), getFaqsForPage('book')]);

	const paymentProvider = getPaymentProvider(parentData.countryCode);

	return { pageSeo, sanityFaqs, paymentProvider };
};