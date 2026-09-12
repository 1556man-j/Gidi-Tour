import { sanityClient } from '../client';

export interface SanityArticle {
	_id: string;
	title: string;
	slug: { current: string };
	image?: { asset: { _ref: string } };
	excerpt: string;
	body?: any[]; // Portable Text blocks — rendered via @portabletext/svelte
	category: string;
	destination?: string;
	readTime?: number;
	date: string;
	featured?: boolean;
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: { asset: { _ref: string } };
	};
}

export async function getAllArticles(): Promise<SanityArticle[]> {
	return sanityClient.fetch(`*[_type == "article"] | order(date desc)`);
}

export async function getArticleBySlug(slug: string): Promise<SanityArticle | null> {
	return sanityClient.fetch(`*[_type == "article" && slug.current == $slug][0]`, { slug });
}

export async function getRelatedArticles(article: SanityArticle): Promise<SanityArticle[]> {
	return sanityClient.fetch(
		`*[_type == "article" && slug.current != $slug && category == $category][0...3]`,
		{ slug: article.slug.current, category: article.category }
	);
}