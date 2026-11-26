import { json } from '@sveltejs/kit';
import { getGuideRecordByEmail, setGuideTours } from '$lib/sanity/queries/guides';
import type { RequestHandler } from './$types';

// Replace the list of tours the guide leads. Only tours in the guide's own country are accepted.
export const PUT: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });

	const guide = await getGuideRecordByEmail(session.user.email);
	if (!guide || (guide.status !== 'active' && guide.status !== 'pending')) return json({ error: 'Guide profile not found.' }, { status: 404 });
	if (!guide.country) return json({ error: 'Add your country to your profile first.' }, { status: 400 });

	const body = await request.json().catch(() => null);
	const slugs = Array.isArray(body?.slugs) ? [...new Set(body.slugs.filter((s: unknown) => typeof s === 'string'))].slice(0, 60) : null;
	if (!slugs) return json({ error: 'Invalid request.' }, { status: 400 });

	await setGuideTours(guide._id, guide.country, slugs as string[]);
	return json({ success: true });
};
