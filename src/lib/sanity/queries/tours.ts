import { sanityClient } from '../client';

export interface SanityTour {
	_id: string;
	title: string;
	slug: { current: string };
	country: string;
	countrySlug: string;
	category?: string;
	image?: { asset: { _ref: string } };
	gallery?: { asset: { _ref: string } }[];
	duration?: string;
	groupSize?: string;
	price: number;
	deposit: number;
	rating?: number;
	reviewCount?: number;
	summary?: string;
	highlights?: string[];
	includes?: string[];
	popular?: boolean;
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: { asset: { _ref: string } };
	};
}

export async function getAllTours(): Promise<SanityTour[]> {
	return sanityClient.fetch(`*[_type == "tour"] | order(title asc)`);
}

export async function getTourBySlug(slug: string): Promise<SanityTour | null> {
	return sanityClient.fetch(`*[_type == "tour" && slug.current == $slug][0]`, { slug });
}

export async function getRelatedTours(countrySlug: string, excludeSlug: string): Promise<SanityTour[]> {
	return sanityClient.fetch(
		`*[_type == "tour" && countrySlug == $countrySlug && slug.current != $excludeSlug][0...3]`,
		{ countrySlug, excludeSlug }
	);
}