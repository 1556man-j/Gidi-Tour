import { json } from '@sveltejs/kit';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import {
	getCustomerByResetToken,
	updateCustomerPassword
} from '$lib/sanity/queries/customer';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
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

		console.log('Reset password token received.');
		console.log('Token hash:', tokenHash);

		const customer = await getCustomerByResetToken(tokenHash);

		if (!customer) {
			console.log('No customer found for reset token.');

			return json(
				{ error: 'This password reset link is invalid or has expired.' },
				{ status: 400 }
			);
		}

		console.log('Resetting password for:', customer.email);

		const passwordHash = await bcrypt.hash(password, 12);

		await updateCustomerPassword(customer._id, passwordHash);

		console.log('Password successfully updated for:', customer.email);

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