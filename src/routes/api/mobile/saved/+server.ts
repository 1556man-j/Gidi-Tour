import { json } from '@sveltejs/kit';
import { db, unwrap } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

const clean = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, 200) : '');

/** The signed-in person's saved tours, so they follow them to a new phone. */
export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const rows = unwrap(await db.from('saved_tours').select('tour_slug').eq('customer_id', session.user.id)) as { tour_slug: string }[];
	return json({ saved: rows.map((r) => r.tour_slug) });
};

/** Replaces the saved list with exactly the slugs sent. The app merges local and server lists first. */
export const PUT: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const body = await request.json().catch(() => null);
	const slugs = [...new Set((Array.isArray(body?.saved) ? body.saved : []).map(clean).filter(Boolean))].slice(0, 500) as string[];

	const uid = session.user.id;
	unwrap(await db.from('saved_tours').delete().eq('customer_id', uid));
	if (slugs.length) {
		unwrap(await db.from('saved_tours').insert(slugs.map((tour_slug) => ({ customer_id: uid, tour_slug }))));
	}
	return json({ saved: slugs });
};
