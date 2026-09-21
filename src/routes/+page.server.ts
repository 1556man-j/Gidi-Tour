import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllArticles } from '$lib/sanity/queries/articles';
import { getAllDestinations } from '$lib/sanity/queries/destinations';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import type { PageServerLoad } from './$types';
import { getTrustpilotReviews } from '$lib/sanity/queries/trustpilotReviews';



export const load: PageServerLoad = async () => {
	const [pageSeo, sanityArticles, sanityDestinations, sanityFaqs, trustpilotReviews] = await Promise.all([
		getPageSeo('home'),
		getAllArticles(),
		getAllDestinations(),
		getFaqsForPage('home'),
		getTrustpilotReviews()
	]);

	return { pageSeo, sanityArticles, sanityDestinations, sanityFaqs, trustpilotReviews };
};