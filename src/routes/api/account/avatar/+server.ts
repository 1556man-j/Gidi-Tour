import { json } from '@sveltejs/kit';
import { sanityWriteClient } from '$lib/sanity/serverClient';
import type { RequestHandler } from './$types';

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 5 * 1024 * 1024;

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const form = await request.formData();
	const file = form.get('avatar');

	if (!(file instanceof File)) return json({ error: 'No image received.' }, { status: 400 });
	if (!ALLOWED.includes(file.type)) {
		return json({ error: 'Please upload a JPG, PNG or WebP image.' }, { status: 400 });
	}
	if (file.size > MAX_BYTES) return json({ error: 'Image must be under 5MB.' }, { status: 400 });

	const buffer = Buffer.from(await file.arrayBuffer());
	const asset = await sanityWriteClient.assets.upload('image', buffer, {
		filename: file.name,
		contentType: file.type
	});

	await sanityWriteClient
		.patch(session.user.id)
		.set({ avatar: { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } })
		.commit();

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	await sanityWriteClient.patch(session.user.id).unset(['avatar']).commit();
	return json({ success: true });
};