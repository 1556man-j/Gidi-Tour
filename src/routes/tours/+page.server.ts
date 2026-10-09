import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllTours } from '$lib/sanity/queries/tours';
import { getAllArticles } from '$lib/sanity/queries/articles';
import type { PageServerLoad } from './$types';
import { getLatestReviews } from '$lib/sanity/queries/reviews';


export const load: PageServerLoad = async () => {
	const [pageSeo, sanityTours, sanityArticles, tourReviews] = await Promise.all([
		getPageSeo('tours'),
		getAllTours(),
		getAllArticles(),
				getLatestReviews(12)
		
	]);
	return { pageSeo, sanityTours, sanityArticles, tourReviews };
};