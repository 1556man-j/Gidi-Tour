import { redirect } from '@sveltejs/kit';
import { sanityClient } from '$lib/sanity/client';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.id) {
		throw redirect(303, '/login?redirectTo=/account/profile');
	}

	const customer = await sanityClient.fetch(`*[_type == "customer" && _id == $id][0]`, {
		id: session.user.id
	});

	return { customer };
};