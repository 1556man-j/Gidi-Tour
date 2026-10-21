import { json } from '@sveltejs/kit';
import { getCustomerProfile } from '$lib/sanity/queries/customer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });
	const customer = await getCustomerProfile(session.user.id);
	return json({ customer: customer ? { ...customer, _id: session.user.id } : null });
};
