import { sanityClient } from '../client';

export interface SanityCity {
	name: string;
	blurb?: string;
	image?: { asset: { _ref: string } };
	gallery?: { asset: { _ref: string } }[];
}

export interface SanityExperienceTour {
	_id: string;
	title: string;
	slug: { current: string };
	price: number;
	deposit: number;
	image?: { asset: { _ref: string } };
	duration?: string;
	country: string;
}

export interface SanityExperience {
	title: string;
	blurb?: string;
	image?: { asset: { _ref: string } };
	tour?: SanityExperienceTour | null;
	href?: string;
}

export interface SanityDestination {
	_id: string;
	name: string;
	slug: { current: string };
	region?: string;
	heroImage?: { asset: { _ref: string } };
	intro?: string;
	bestTime?: string;
	duration?: string;
	priceFrom?: string;
	cities?: SanityCity[];
	thingsToDo?: string[];
	experiences?: SanityExperience[];
	food?: { name: string; desc?: string }[];
	travelTips?: string[];
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: { asset: { _ref: string } };
	};
}
export type SanityCityImage = { asset: { _ref: string } };

export async function getAllDestinations(): Promise<SanityDestination[]> {
	return sanityClient.fetch(`*[_type == "destination"] | order(name asc)`);
}

export async function getDestinationBySlug(slug: string): Promise<SanityDestination | null> {
	return sanityClient.fetch(
		`*[_type == "destination" && slug.current == $slug][0]{
			...,
			experiences[]{
				...,
				tour->{ _id, title, slug, price, deposit, image, duration, country }
			}
		}`,
		{ slug }
	);
}