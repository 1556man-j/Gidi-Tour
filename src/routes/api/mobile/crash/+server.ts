import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';
import { isRateLimited, ipOf } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

const cut = (v: unknown, n: number) => (typeof v === 'string' ? v.slice(0, n) : null);

/** Free crash reporting: the app posts unexpected errors here and they land in the app_errors table. */
export const POST: RequestHandler = async ({ locals, request, getClientAddress }) => {
	if (await isRateLimited(`crash:${ipOf(getClientAddress)}`, 30, 3600)) return json({ ok: true });
	const body = await request.json().catch(() => null);
	if (!body?.message) return json({ ok: true });
	const session = await locals.auth().catch(() => null);
	const { error } = await db.from('app_errors').insert({
		platform: cut(body.platform, 20), app_version: cut(body.appVersion, 30), message: cut(body.message, 500),
		stack: cut(body.stack, 4000), screen: cut(body.screen, 200), customer_id: session?.user?.id ?? null
	});
	if (error) console.error('Crash log insert failed:', error.message);
	return json({ ok: true });
};
