import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getCustomerByEmail, createCustomer } from '$lib/sanity/queries/customer';
import { createGuideApplication } from '$lib/sanity/queries/guides';
import { validateApplication } from '$lib/server/guideApplication';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import { issueEmailVerification } from '$lib/server/verifyEmail';
import type { RequestHandler } from './$types';

// Create an account AND apply to be a guide in one go. The application waits in Sanity until your team switches the guide on.
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (await isRateLimited(`guide-signup:${ipOf(getClientAddress)}`, 5, 3600)) return tooManyRequests();

	const body = await request.json().catch(() => null);
	if (!body) return json({ error: 'Invalid request.' }, { status: 400 });

	const { name, email, password, nationality, phoneDialCode, phoneNumber } = body;
	const fieldErrors: Record<string, string> = {};
	if (!name || String(name).trim().length < 2) fieldErrors.name = 'Please enter your full name.';
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fieldErrors.email = 'Please enter a valid email address.';
	if (!password || String(password).length < 8) fieldErrors.password = 'Password must be at least 8 characters.';
	if (!nationality) fieldErrors.nationality = 'Please select your nationality.';
	if (!phoneNumber || String(phoneNumber).trim().length < 6) fieldErrors.phoneNumber = 'Please enter a valid phone number.';

	const app = validateApplication(body.application);
	if (!app.ok) Object.assign(fieldErrors, app.fieldErrors);

	if (Object.keys(fieldErrors).length || !app.ok) {
		return json({ error: 'Please fix the highlighted fields.', fieldErrors }, { status: 400 });
	}

	if (await getCustomerByEmail(email)) {
		return json({ error: 'An account with this email already exists.', fieldErrors: { email: 'Already in use.' } }, { status: 409 });
	}

	let created: { _id: string };
	try {
		created = await createCustomer({
			name,
			email,
			passwordHash: await bcrypt.hash(password, 12),
			provider: 'credentials',
			nationality,
			phoneDialCode,
			phoneNumber
		});
	} catch (error) {
		if ((error as { code?: string }).code === '23505') {
			return json({ error: 'An account with this email already exists.', fieldErrors: { email: 'Already in use.' } }, { status: 409 });
		}
		throw error;
	}

	let applicationSaved = true;
	try {
		await createGuideApplication(
			{ id: created._id, name: String(name).trim(), email, phone: `${phoneDialCode ?? ''} ${phoneNumber}`.trim() },
			app.value
		);
	} catch (error) {
		// The account exists, so the person can send the application again from the app once signed in.
		console.error('Could not save the guide application:', error);
		applicationSaved = false;
	}

	let emailSent = true;
	try {
		await issueEmailVerification(created._id, String(email).trim().toLowerCase(), String(name).trim());
	} catch (error) {
		console.error('Could not send the confirmation email:', error);
		emailSent = false;
	}

	return json({ success: true, needsVerification: true, emailSent, applicationSaved });
};
