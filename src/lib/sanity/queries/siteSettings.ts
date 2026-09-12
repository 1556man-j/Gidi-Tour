import { sanityClient } from '../client';

export interface SiteSettings {
	siteName?: string;
	logo?: { asset: { _ref: string } };
	tagline?: string;
	email?: string;
	phone?: string;
	whatsapp?: string;
	address?: string;
	socials?: { platform: string; url: string }[];
	defaultSeo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: { asset: { _ref: string } };
	};
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
	return sanityClient.fetch(`*[_type == "siteSettings"][0]`);
}