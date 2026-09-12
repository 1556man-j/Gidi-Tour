import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllTours } from '$lib/sanity/queries/tours';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, sanityTours] = await Promise.all([getPageSeo('tours'), getAllTours()]);
	return { pageSeo, sanityTours };
};