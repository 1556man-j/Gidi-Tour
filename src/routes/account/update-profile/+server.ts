import { json } from '@sveltejs/kit';
import { sanityWriteClient } from '$lib/sanity/serverClient';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) {
		return json({ error: 'Not authenticated.' }, { status: 401 });
	}

	const { name, phoneDialCode, phoneNumber, nationality } = await request.json();

	await sanityWriteClient
		.patch(session.user.id)
		.set({ name, phoneDialCode, phoneNumber, nationality })
		.commit();

	return json({ success: true });
};