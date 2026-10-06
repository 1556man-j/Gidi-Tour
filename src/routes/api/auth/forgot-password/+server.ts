import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import { getCustomerByEmail, setPasswordResetToken } from '$lib/sanity/queries/customer';
import { sendPasswordResetEmail } from '$lib/server/passwordResetEmail';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email } = await request.json();

		if (!email) {
			return json({ error: 'Email is required.' }, { status: 400 });
		}

		const normalizedEmail = email.trim().toLowerCase();

		const customer = await getCustomerByEmail(normalizedEmail);

		// Don't reveal whether an email exists.
		if (!customer) {
			return json({
				success: true,
				message: 'If an account exists, a password reset link has been sent.'
			});
		}

		// Generate the raw token.
		const token = crypto.randomBytes(32).toString('hex');

		// Store only the hash in Sanity.
		const tokenHash = crypto
			.createHash('sha256')
			.update(token)
			.digest('hex');

		// Token expires after 30 minutes.
		const expiresAt = new Date(
			Date.now() + 30 * 60 * 1000
		).toISOString();

		await setPasswordResetToken(
			customer._id,
			tokenHash,
			expiresAt
		);

		// This is the actual link the customer should receive.
		const resetUrl =
			`https://giditour.com/reset-password?token=${encodeURIComponent(token)}`;

		// IMPORTANT: send resetUrl, NOT token.
		await sendPasswordResetEmail(
			customer.email,
			customer.name,
			resetUrl
		);

		console.log(`Password reset email sent to ${customer.email}`);
		console.log(`Reset URL: ${resetUrl}`);

		return json({
			success: true,
			message: 'If an account exists, a password reset link has been sent.'
		});
	} catch (error) {
		console.error('FORGOT PASSWORD ERROR:', error);

		return json(
			{
				error: 'Could not send the password reset email. Please try again.'
			},
			{ status: 500 }
		);
	}
};