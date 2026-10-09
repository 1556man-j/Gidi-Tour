import { sanityClient as client } from '$lib/sanity/client';

export interface SanityReview {
	_id: string;
	name: string;
	location?: string;
	rating: number;
	title?: string;
	comment: string;
	createdAt: string;
	tour?: { title: string; slug: string };
}

const FIELDS = `_id, name, location, rating, title, comment, createdAt,
	"tour": tour->{ title, "slug": slug.current }`;

export function getReviewsForTour(slug: string): Promise<SanityReview[]> {
	return client.fetch(
		`*[_type == "review" && approved == true && tour->slug.current == $slug]
		 | order(createdAt desc)[0...50]{ ${FIELDS} }`,
		{ slug }
	);
}

export function getLatestReviews(limit = 12): Promise<SanityReview[]> {
	return client.fetch(
		`*[_type == "review" && approved == true]
		 | order(createdAt desc)[0...$limit]{ ${FIELDS} }`,
		{ limit }
	);
}