import { error } from '@sveltejs/kit';
import { getDestinationBySlug } from '$lib/sanity/queries/destinations';
import { getToursForDestination } from '$lib/sanity/queries/tours';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const destination = await getDestinationBySlug(params.slug);

	if (!destination) {
		throw error(404, 'Destination not found');
	}

	// Tours are matched automatically by country slug. Nothing is linked by hand in Sanity.
	const tours = await getToursForDestination(destination.slug.current);

	return { destination, tours };
};
