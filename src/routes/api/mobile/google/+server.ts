import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { GOOGLE_CLIENT_ID } from '$env/static/private';
import { getCustomerByEmail, createCustomer, convertToGoogleAccount } from '$lib/sanity/queries/customer';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { issueMobileToken } from '$lib/server/mobileSession';
import type { RequestHandler } from './$types';

// Set MOBILE_GOOGLE_CLIENT_IDS="iosId,androidId" if you use native iOS/Android client IDs.
const allowedAudiences = () =>
	new Set([GOOGLE_CLIENT_ID, ...(env.MOBILE_GOOGLE_CLIENT_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)]);

export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	if (await isRateLimited(`mobile-google:${ipOf(getClientAddress)}`, 30, 900)) return tooManyRequests();

	const { idToken } = await request.json().catch(() => ({}));
	if (typeof idToken !== 'string' || !idToken) return json({ error: 'Missing Google token.' }, { status: 400 });

	// Google checks the signature and expiry for us.
	const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
	if (!res.ok) return json({ error: 'Google sign-in failed.' }, { status: 401 });
	const info = await res.json();

	if (!allowedAudiences().has(info.aud) || String(info.email_verified) !== 'true' || !info.email) {
		return json({ error: 'Google sign-in failed.' }, { status: 401 });
	}

	const existing = await getCustomerByEmail(info.email);
	let id: string;
	let name: string | undefined = info.name;
	if (!existing) {
		id = (await createCustomer({ name: info.name, email: info.email, provider: 'google', emailVerified: true }))._id;
	} else {
		if (!existing.emailVerified) await convertToGoogleAccount(existing._id);
		id = existing._id;
		name = existing.name ?? info.name;
	}

	const user = { id, email: String(info.email).toLowerCase(), name };
	return json({ token: await issueMobileToken(user, url), user });
};
