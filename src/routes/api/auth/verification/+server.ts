import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getCustomerByEmail } from '$lib/sanity/queries/customer';
import { issueEmailVerification } from '$lib/server/verifyEmail';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

// Used by the login page after a failed login, to tell someone whose password is
// RIGHT but whose email isn't confirmed yet, and to send them a new link.
// It needs the correct password, so it can't be used to find out which emails have accounts.
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (await isRateLimited(`verification-ip:${ipOf(getClientAddress)}`, 20, 900)) {
		return tooManyRequests();
	}

	let body: { email?: unknown; password?: unknown; action?: unknown };

	try {
		body = await request.json();
	} catch {
		return json({ unverified: false });
	}

	const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
	const password = typeof body.password === 'string' ? body.password : '';

	if (!email || !password) return json({ unverified: false });

	if (await isRateLimited(`verification-email:${email}`, 8, 3600)) return tooManyRequests();

	const customer = await getCustomerByEmail(email);

	if (!customer || !customer.passwordHash || customer.emailVerified) {
		return json({ unverified: false });
	}

	if (!(await bcrypt.compare(password, customer.passwordHash))) {
		return json({ unverified: false });
	}

	if (body.action === 'resend') {
		try {
			await issueEmailVerification(customer._id, customer.email, customer.name);
			return json({ unverified: true, sent: true });
		} catch (error) {
			console.error('Resend verification failed:', error);
			return json({ error: 'Could not send the email. Please try again.' }, { status: 500 });
		}
	}

	return json({ unverified: true });
};
