import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllArticles } from '$lib/sanity/queries/articles';
import { getAllDestinations } from '$lib/sanity/queries/destinations';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, sanityArticles, sanityDestinations, sanityFaqs] = await Promise.all([
		getPageSeo('home'),
		getAllArticles(),
		getAllDestinations(),
		getFaqsForPage('home')
	]);

	return { pageSeo, sanityArticles, sanityDestinations, sanityFaqs };
};