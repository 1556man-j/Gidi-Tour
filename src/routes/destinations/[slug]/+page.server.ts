import { error } from '@sveltejs/kit';
import { getDestinationBySlug } from '$lib/sanity/queries/destinations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const destination = await getDestinationBySlug(params.slug);

	if (!destination) {
		throw error(404, 'Destination not found');
	}

	return { destination };
};