import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const pageSeo = await getPageSeo('home');
	return { pageSeo };
};