import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { getGuideRecordByEmail } from '$lib/sanity/queries/guides';
import type { RequestHandler } from './$types';

// Tells the app whether this person is a guide (and what to show them).
export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });

	const guide = await getGuideRecordByEmail(session.user.email);
	if (!guide) return json({ status: 'none', guide: null });

	let photoUrl = guide.photoUrl;
	if (!photoUrl) {
		const { data } = await db.from('customers').select('avatar_url').eq('id', session.user.id).maybeSingle();
		photoUrl = data?.avatar_url ?? undefined;
	}

	return json({ status: guide.status, guide: { ...guide, photoUrl: photoUrl ?? null } });
};
