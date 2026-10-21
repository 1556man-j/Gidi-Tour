import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getCustomerByEmail } from '$lib/sanity/queries/customer';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { issueMobileToken } from '$lib/server/mobileSession';
import type { RequestHandler } from './$types';

// Same checks as the Credentials provider in src/auth.ts, but returns a token instead of setting a cookie.
export const POST: RequestHandler = async ({ request, getClientAddress, url }) => {
	const body = await request.json().catch(() => null);
	const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
	const password = typeof body?.password === 'string' ? body.password : '';
	if (!email || !password) return json({ error: 'Enter your email and password.' }, { status: 400 });

	if ((await isRateLimited(`login-email:${email}`, 10, 900)) || (await isRateLimited(`login-ip:${ipOf(getClientAddress)}`, 30, 900))) {
		return tooManyRequests();
	}

	const customer = await getCustomerByEmail(email);
	const valid = !!customer?.passwordHash && (await bcrypt.compare(password, customer.passwordHash));
	if (!customer || !valid) return json({ error: 'Incorrect email or password.' }, { status: 401 });

	if (!customer.emailVerified) {
		return json({ error: 'Please confirm your email address first.', code: 'unverified' }, { status: 403 });
	}

	const user = { id: customer._id, email: customer.email, name: customer.name };
	return json({ token: await issueMobileToken(user, url), user });
};
