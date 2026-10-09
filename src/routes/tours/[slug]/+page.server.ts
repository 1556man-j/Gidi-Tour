import { error, fail } from '@sveltejs/kit';
import { getTourBySlug, getRelatedTours } from '$lib/sanity/queries/tours';
import { getReviewsForTour } from '$lib/sanity/queries/reviews';
import { sanityClient as client } from '$lib/sanity/client';
import { writeClient } from '$lib/sanity/writeClient';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const tour = await getTourBySlug(params.slug);

	if (!tour) {
		throw error(404, 'Tour not found');
	}

	const [related, reviews] = await Promise.all([
		getRelatedTours(tour.countrySlug, tour.slug.current),
		getReviewsForTour(params.slug)
	]);

	return { tour, related, reviews };
};

export const actions: Actions = {
	submitReview: async ({ request, params }) => {
		const fd = await request.formData();

		// honeypot: bots fill this in, humans never see it
		if (fd.get('website')) return { success: true };

		const name = String(fd.get('name') ?? '').trim();
		const location = String(fd.get('location') ?? '').trim();
		const title = String(fd.get('title') ?? '').trim();
		const comment = String(fd.get('comment') ?? '').trim();
		const rating = Number(fd.get('rating'));
		const values = { name, location, title, comment, rating };

		if (name.length < 2 || name.length > 60)
			return fail(400, { error: 'Please enter your name.', ...values });
		if (location.length > 60)
			return fail(400, { error: 'Location is too long.', ...values });
		if (!Number.isInteger(rating) || rating < 1 || rating > 5)
			return fail(400, { error: 'Please choose a star rating.', ...values });
		if (comment.length < 10 || comment.length > 1500)
			return fail(400, { error: 'Your review should be 10–1500 characters.', ...values });

		const tourId = await client.fetch<string | null>(
			`*[_type == "tour" && slug.current == $slug][0]._id`,
			{ slug: params.slug }
		);
		if (!tourId) return fail(404, { error: 'Tour not found.', ...values });

		await writeClient.create({
			_type: 'review',
			tour: { _type: 'reference', _ref: tourId },
			name,
			location,
			title,
			comment,
			rating,
			approved: false,
			createdAt: new Date().toISOString()
		});

		return { success: true };
	}
};