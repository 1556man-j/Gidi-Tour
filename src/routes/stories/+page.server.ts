import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllArticles } from '$lib/sanity/queries/articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, sanityArticles] = await Promise.all([getPageSeo('stories'), getAllArticles()]);
	return { pageSeo, sanityArticles };
};