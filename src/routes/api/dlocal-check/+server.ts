import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dlocalHeaders, DLOCAL_API_BASE, dlocalSetupSummary } from '$lib/server/dlocalClient';
import type { RequestHandler } from './$types';

/**
 * One-off dLocal credentials test. It only works if you set DLOCAL_CHECK_KEY on the host, and you call:
 *   https://www.giditour.com/api/dlocal-check?key=<your DLOCAL_CHECK_KEY>&country=NG
 * It makes a harmless signed request (list of payment methods) and reports dLocal's answer.
 * Remove DLOCAL_CHECK_KEY from the host when you are done and this returns 404 again.
 */
export const GET: RequestHandler = async ({ url }) => {
	const secret = (env.DLOCAL_CHECK_KEY ?? '').trim();
	if (!secret || url.searchParams.get('key') !== secret) return json({ error: 'Not found.' }, { status: 404 });

	const country = (url.searchParams.get('country') || 'NG').toUpperCase().slice(0, 2);
	const res = await fetch(`${DLOCAL_API_BASE}/payments-methods?country=${country}`, { headers: dlocalHeaders('') });
	let body: any = null;
	try { body = await res.json(); } catch { body = null; }

	return json({
		setup: dlocalSetupSummary(),
		dlocalStatus: res.status,
		credentialsAccepted: res.ok,
		dlocalCode: body?.code ?? null,
		dlocalMessage: body?.message ?? null,
		methodCount: Array.isArray(body) ? body.length : undefined
	});
};
