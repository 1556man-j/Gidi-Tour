import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllTours } from '$lib/sanity/queries/tours';
import { getAllArticles } from '$lib/sanity/queries/articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, sanityTours, sanityArticles] = await Promise.all([
		getPageSeo('tours'),
		getAllTours(),
		getAllArticles()
	]);
	return { pageSeo, sanityTours, sanityArticles };
};