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

export interface DestinationTour {
	_id: string;
	title: string;
	slug: { current: string };
	country: string;
	countrySlug: string;
	price: number;
	image?: { asset: { _ref: string } };
	duration?: string;
	summary?: string;
	popular?: boolean;
	rating?: number;
	reviewCount?: number;
}

// ---------------------------------------------------------------------------
// Ratings come from REAL, approved customer reviews.
// If a tour has approved reviews, its rating and review count are worked out from
// them automatically. If it has none, a rating you typed into the tour in the
// Studio is used only when it comes with a review count above zero. Otherwise no
// rating is shown at all, instead of a misleading "0".
// ---------------------------------------------------------------------------

type ReviewStats = Map<string, { sum: number; count: number }>;

async function getReviewStats(): Promise<ReviewStats> {
	const rows: { tour: string; rating: number }[] = await sanityClient.fetch(
		`*[_type == "review" && approved == true && defined(tour) && defined(rating)]{ "tour": tour._ref, rating }`
	);

	const stats: ReviewStats = new Map();

	for (const row of rows) {
		const entry = stats.get(row.tour) ?? { sum: 0, count: 0 };
		entry.sum += row.rating;
		entry.count += 1;
		stats.set(row.tour, entry);
	}

	return stats;
}

function withRating<T extends { _id: string; rating?: number; reviewCount?: number }>(
	tour: T,
	stats: ReviewStats
): T {
	const real = stats.get(tour._id);

	if (real && real.count > 0) {
		return { ...tour, rating: Math.round((real.sum / real.count) * 10) / 10, reviewCount: real.count };
	}

	const hasSourcedRating =
		typeof tour.rating === 'number' && tour.rating > 0 && (tour.reviewCount ?? 0) > 0;

	return hasSourcedRating ? tour : { ...tour, rating: undefined, reviewCount: undefined };
}

export async function getAllTours(): Promise<SanityTour[]> {
	const [tours, stats]: [SanityTour[], ReviewStats] = await Promise.all([
		sanityClient.fetch(`*[_type == "tour"] | order(title asc)`),
		getReviewStats()
	]);

	return tours.map((tour) => withRating(tour, stats));
}

export async function getTourBySlug(slug: string): Promise<SanityTour | null> {
	const [tour, stats]: [SanityTour | null, ReviewStats] = await Promise.all([
		sanityClient.fetch(`*[_type == "tour" && slug.current == $slug][0]`, { slug }),
		getReviewStats()
	]);

	return tour ? withRating(tour, stats) : null;
}

export async function getRelatedTours(
	countrySlug: string,
	excludeSlug: string
): Promise<SanityTour[]> {
	const [tours, stats]: [SanityTour[], ReviewStats] = await Promise.all([
		sanityClient.fetch(
			`*[_type == "tour" && countrySlug == $countrySlug && slug.current != $excludeSlug][0...3]`,
			{ countrySlug, excludeSlug }
		),
		getReviewStats()
	]);

	return tours.map((tour) => withRating(tour, stats));
}

// Every tour whose "Country slug" matches the destination. Nothing has to be linked by hand:
// add a tour with countrySlug "kenya" and it appears on the Kenya destination page.
export async function getToursForDestination(countrySlug: string): Promise<DestinationTour[]> {
	const [tours, stats]: [DestinationTour[], ReviewStats] = await Promise.all([
		sanityClient.fetch(
			`*[_type == "tour" && countrySlug == $countrySlug] | order(popular desc, title asc){
				_id, title, slug, country, countrySlug, price, image, duration, summary, popular, rating, reviewCount
			}`,
			{ countrySlug }
		),
		getReviewStats()
	]);

	return tours.map((tour) => withRating(tour, stats));
}
