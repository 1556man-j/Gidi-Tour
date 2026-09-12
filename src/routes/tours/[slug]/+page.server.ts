import { error } from '@sveltejs/kit';
import { getTourBySlug, getRelatedTours } from '$lib/sanity/queries/tours';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const tour = await getTourBySlug(params.slug);

	if (!tour) {
		throw error(404, 'Tour not found');
	}

	const related = await getRelatedTours(tour.countrySlug, tour.slug.current);

	return { tour, related };
};