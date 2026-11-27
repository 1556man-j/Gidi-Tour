import { json } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';
import { getCustomerByEmail } from '$lib/sanity/queries/customer';
import { deleteAccountData, hasUpcomingPaidTrip } from '$lib/server/accountDeletion';
import { isRateLimited, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

// Used by the app and by the /delete-account page. Needs a signed-in person.
export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Please sign in first.' }, { status: 401 });
	if (await isRateLimited(`delete-account:${session.user.id}`, 5, 3600)) return tooManyRequests();

	const body = await request.json().catch(() => null);
	if (body?.confirm !== 'DELETE') return json({ error: 'Type DELETE to confirm.', fieldErrors: { confirm: 'Type DELETE to confirm.' } }, { status: 400 });

	const customer = await getCustomerByEmail(session.user.email);
	if (!customer || customer._id !== session.user.id) return json({ error: 'Account not found.' }, { status: 404 });

	// Accounts with a password must re-enter it, so a lost phone can't be used to wipe the account.
	if (customer.passwordHash) {
		const ok = typeof body?.password === 'string' && (await bcrypt.compare(body.password, customer.passwordHash));
		if (!ok) return json({ error: 'That password is not correct.', fieldErrors: { password: 'That password is not correct.' } }, { status: 403 });
	}

	if (await hasUpcomingPaidTrip(customer._id)) {
		return json(
			{ error: 'You have an upcoming paid trip. Please contact us to change or cancel it first, then delete your account.', code: 'upcoming_trip' },
			{ status: 409 }
		);
	}

	await deleteAccountData(customer._id, customer.email);
	return json({ success: true });
};
