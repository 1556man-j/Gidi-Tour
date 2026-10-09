import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllArticles } from '$lib/sanity/queries/articles';
import { getAllDestinations } from '$lib/sanity/queries/destinations';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import { getTrustpilotReviews } from '$lib/sanity/queries/trustpilotReviews';
import { getLatestReviews } from '$lib/sanity/queries/reviews';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [
		pageSeo,
		sanityArticles,
		sanityDestinations,
		sanityFaqs,
		trustpilotReviews,
		tourReviews
	] = await Promise.all([
		getPageSeo('home'),
		getAllArticles(),
		getAllDestinations(),
		getFaqsForPage('home'),
		getTrustpilotReviews(),
		getLatestReviews(12)
	]);

	return {
		pageSeo,
		sanityArticles,
		sanityDestinations,
		sanityFaqs,
		trustpilotReviews,
		tourReviews
	};
};