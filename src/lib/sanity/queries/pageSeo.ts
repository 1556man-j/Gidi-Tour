import { sanityClient } from '../client';

export interface PageSeoData {
	metaTitle?: string;
	metaDescription?: string;
	ogImage?: { asset: { _ref: string } };
}

export async function getPageSeo(pageId: string): Promise<PageSeoData | null> {
	const result = await sanityClient.fetch<{ seo: PageSeoData } | null>(
		`*[_type == "pageSeo" && pageId == $pageId][0]{ seo }`,
		{ pageId }
	);
	return result?.seo ?? null;
}