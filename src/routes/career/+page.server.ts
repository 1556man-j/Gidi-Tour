import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getOpenPositions, getPostcards, getTeamQuotes } from '$lib/sanity/queries/careers';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pageSeo, positions, postcards, quotes] = await Promise.all([
		getPageSeo('careers'),
		getOpenPositions(),
		getPostcards(),
		getTeamQuotes()
	]);
	return { pageSeo, positions, postcards, quotes };
};