import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getCustomerByEmail, createCustomer } from '$lib/sanity/queries/customer';
import type { RequestHandler } from './$types';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { issueEmailVerification } from '$lib/server/verifyEmail';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (await isRateLimited(`signup:${ipOf(getClientAddress)}`, 5, 3600)) return tooManyRequests();

	const { name, email, password, nationality, phoneDialCode, phoneNumber } = await request.json();

	const fieldErrors: Record<string, string> = {};

	if (!name || name.trim().length < 2) {
		fieldErrors.name = 'Please enter your full name.';
	}
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		fieldErrors.email = 'Please enter a valid email address.';
	}
	if (!password || password.length < 8) {
		fieldErrors.password = 'Password must be at least 8 characters.';
	}
	if (!nationality) {
		fieldErrors.nationality = 'Please select your nationality.';
	}
	if (!phoneNumber || phoneNumber.trim().length < 6) {
		fieldErrors.phoneNumber = 'Please enter a valid phone number.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return json({ error: 'Please fix the highlighted fields.', fieldErrors }, { status: 400 });
	}

	const existing = await getCustomerByEmail(email);
	if (existing) {
		return json(
			{
				error: 'An account with this email already exists.',
				fieldErrors: { email: 'Already in use.' }
			},
			{ status: 409 }
		);
	}

	const passwordHash = await bcrypt.hash(password, 12);

	let created: { _id: string };

	try {
		created = await createCustomer({
			name,
			email,
			passwordHash,
			provider: 'credentials',
			nationality,
			phoneDialCode,
			phoneNumber
		});
	} catch (error) {
		// 23505 = unique violation: the email was registered a moment ago.
		if ((error as { code?: string }).code === '23505') {
			return json(
				{
					error: 'An account with this email already exists.',
					fieldErrors: { email: 'Already in use.' }
				},
				{ status: 409 }
			);
		}
		throw error;
	}

	// The account can't be used until the email is confirmed.
	let emailSent = true;

	try {
		await issueEmailVerification(created._id, email.trim().toLowerCase(), name.trim());
	} catch (error) {
		console.error('Could not send the confirmation email:', error);
		emailSent = false; // the login page offers to send it again
	}

	return json({ success: true, needsVerification: true, emailSent });
};
