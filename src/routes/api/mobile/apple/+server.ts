import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { getCustomerByEmail, createCustomer, convertToGoogleAccount } from '$lib/sanity/queries/customer';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { issueMobileToken } from '$lib/server/mobileSession';
import type { RequestHandler } from './$types';

const jwks = createRemoteJWKSet(new URL('https://appleid.apple.com/auth/keys'));
// The app's iOS bundle id. Expo Go uses host.exp.Exponent, so it is allowed too for testing.
const audiences = () => [env.APPLE_BUNDLE_ID || 'com.giditour.app', 'host.exp.Exponent'];

export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	if (await isRateLimited(`mobile-apple:${ipOf(getClientAddress)}`, 30, 900)) return tooManyRequests();

	const body = await request.json().catch(() => ({}));
	const identityToken = body?.identityToken;
	if (typeof identityToken !== 'string' || !identityToken) return json({ error: 'Missing Apple token.' }, { status: 400 });

	let email: string | undefined;
	try {
		const { payload } = await jwtVerify(identityToken, jwks, { issuer: 'https://appleid.apple.com', audience: audiences() });
		email = typeof payload.email === 'string' ? payload.email.toLowerCase() : undefined;
		const verified = payload.email_verified === true || payload.email_verified === 'true';
		if (!email || !verified) return json({ error: 'Apple sign-in failed.' }, { status: 401 });
	} catch {
		return json({ error: 'Apple sign-in failed.' }, { status: 401 });
	}

	// (Stored with provider 'google', the existing "signed in through someone else" type, so no database change is needed.)
	// Apple only sends the person's name the first time, and the app passes it along.
	const given = typeof body?.fullName === 'string' ? body.fullName.trim().slice(0, 100) : '';

	const existing = await getCustomerByEmail(email);
	let id: string;
	let name: string | undefined = given || undefined;
	if (!existing) {
		id = (await createCustomer({ name: given || undefined, email, provider: 'google', emailVerified: true }))._id;
	} else {
		if (!existing.emailVerified) await convertToGoogleAccount(existing._id);
		id = existing._id;
		name = existing.name ?? name;
	}

	const user = { id, email, name };
	return json({ token: await issueMobileToken(user, url), user });
};
