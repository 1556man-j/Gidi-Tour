import { getSiteSettings } from '$lib/sanity/queries/siteSettings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const siteSettings = await getSiteSettings();
	return { siteSettings };
};