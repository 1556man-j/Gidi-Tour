import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
	getCustomerByResetToken,
	updateCustomerPassword
} from '$lib/sanity/queries/customer';
import type { RequestHandler } from './$types';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (await isRateLimited(`reset:${ipOf(getClientAddress)}`, 10, 3600)) return tooManyRequests();

	try {
		const { token, password } = await request.json();

		if (!token || !password) {
			return json(
				{ error: 'Token and password are required.' },
				{ status: 400 }
			);
		}

		if (typeof password !== 'string' || password.length < 8) {
			return json(
				{ error: 'Password must be at least 8 characters.' },
				{ status: 400 }
			);
		}

		const tokenHash = crypto
			.createHash('sha256')
			.update(token)
			.digest('hex');

		const customer = await getCustomerByResetToken(tokenHash);

		if (!customer) {
			return json(
				{ error: 'This password reset link is invalid or has expired.' },
				{ status: 400 }
			);
		}

		const passwordHash = await bcrypt.hash(password, 12);

		await updateCustomerPassword(customer._id, passwordHash);

		return json({
			success: true
		});
	} catch (error) {
		console.error('RESET PASSWORD ERROR:', error);

		return json(
			{
				error: 'Could not reset your password. Please try again.'
			},
			{ status: 500 }
		);
	}
};