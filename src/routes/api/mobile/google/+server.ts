import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { GOOGLE_CLIENT_ID } from '$env/static/private';
import { getCustomerByEmail, createCustomer, convertToGoogleAccount } from '$lib/sanity/queries/customer';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { issueMobileToken } from '$lib/server/mobileSession';
import { OAuth2Client } from 'google-auth-library';
import type { RequestHandler } from './$types';

const googleClient = new OAuth2Client();

// Set MOBILE_GOOGLE_CLIENT_IDS="iosId,androidId" if you use native iOS/Android client IDs.
const allowedAudiences = () =>
	new Set([GOOGLE_CLIENT_ID, ...(env.MOBILE_GOOGLE_CLIENT_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)]);

export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	if (await isRateLimited(`mobile-google:${ipOf(getClientAddress)}`, 30, 900)) return tooManyRequests();

	const { idToken } = await request.json().catch(() => ({}));
	if (typeof idToken !== 'string' || !idToken) return json({ error: 'Missing Google token.' }, { status: 400 });

	// Verify the signature, issuer, expiry and audience with Google's own library.
	let info: { email?: string; email_verified?: boolean; name?: string } | undefined;
	try {
		const ticket = await googleClient.verifyIdToken({ idToken, audience: [...allowedAudiences()] });
		info = ticket.getPayload();
	} catch {
		return json({ error: 'Google sign-in failed.' }, { status: 401 });
	}
	if (!info?.email || info.email_verified !== true) return json({ error: 'Google sign-in failed.' }, { status: 401 });

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
