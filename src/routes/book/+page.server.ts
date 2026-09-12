import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, sanityFaqs] = await Promise.all([getPageSeo('book'), getFaqsForPage('book')]);
	return { pageSeo, sanityFaqs };
};