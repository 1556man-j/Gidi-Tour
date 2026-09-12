import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getAllDestinations } from '$lib/sanity/queries/destinations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, sanityDestinations] = await Promise.all([
		getPageSeo('destinations'),
		getAllDestinations()
	]);
	return { pageSeo, sanityDestinations };
};