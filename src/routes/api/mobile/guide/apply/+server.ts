import { json } from '@sveltejs/kit';
import { getCustomerProfile } from '$lib/sanity/queries/customer';
import { createGuideApplication, getGuideRecordByEmail } from '$lib/sanity/queries/guides';
import { validateApplication } from '$lib/server/guideApplication';
import { isRateLimited, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

// A signed-in traveller applying to become a guide.
export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });
	if (await isRateLimited(`guide-apply:${session.user.id}`, 5, 3600)) return tooManyRequests();

	const body = await request.json().catch(() => null);
	const app = validateApplication(body?.application);
	if (!app.ok) return json({ error: 'Please fix the highlighted fields.', fieldErrors: app.fieldErrors }, { status: 400 });

	const existing = await getGuideRecordByEmail(session.user.email);
	if (existing && existing.status !== 'rejected') {
		return json({ error: existing.status === 'active' ? 'You are already a guide.' : 'Your application is already being reviewed.' }, { status: 409 });
	}

	const profile: any = await getCustomerProfile(session.user.id);
	await createGuideApplication(
		{
			id: session.user.id,
			name: profile?.name ?? session.user.name ?? session.user.email,
			email: session.user.email,
			phone: [profile?.phoneDialCode, profile?.phoneNumber].filter(Boolean).join(' ') || undefined
		},
		app.value
	);
	return json({ success: true });
};
