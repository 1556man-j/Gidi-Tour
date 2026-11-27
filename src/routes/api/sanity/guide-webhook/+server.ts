import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { sanityWriteClient } from '$lib/sanity/serverClient';
import { sendSimpleEmail } from '$lib/server/simpleEmail';
import { SITE_URL } from '$lib/server/siteUrl';
import type { RequestHandler } from './$types';

// Sanity calls this when a guide document changes. It emails the guide once when they are approved, and once if declined.
// Set it up in Sanity: Manage > API > Webhooks (see the steps that came with this update).
export const POST: RequestHandler = async ({ request }) => {
	const secret = env.SANITY_WEBHOOK_SECRET;
	if (!secret || request.headers.get('x-webhook-secret') !== secret) return json({ error: 'Unauthorized.' }, { status: 401 });

	const body = await request.json().catch(() => null);
	const id: string | undefined = body?._id;
	if (!id || typeof id !== 'string') return json({ ok: true });

	// Read the live document (not the webhook copy) so the flags below are always current.
	const g = await sanityWriteClient.fetch(
		`*[_id == $id && _type == "guide"][0]{ _id, name, email, active, applicationStatus, approvalEmailSentAt, rejectionEmailSentAt }`,
		{ id }
	);
	if (!g?.email) return json({ ok: true });
	const first = String(g.name ?? '').split(' ')[0] || 'there';

	if (g.active === true && !g.approvalEmailSentAt) {
		await sanityWriteClient.patch(g._id).set({ approvalEmailSentAt: new Date().toISOString() }).commit();
		await sendSimpleEmail(
			g.email,
			'You are approved as a Gidi Tour guide',
			'Welcome to the guide team!',
			`Hi ${first}, your guide application has been approved. Open the Gidi Tour app and sign in. You will now see the guide screens, where travellers who book your tours will message you.`,
			{ label: 'Open Gidi Tour', url: SITE_URL }
		);
	} else if (g.active !== true && g.applicationStatus === 'rejected' && !g.rejectionEmailSentAt) {
		await sanityWriteClient.patch(g._id).set({ rejectionEmailSentAt: new Date().toISOString() }).commit();
		await sendSimpleEmail(
			g.email,
			'About your Gidi Tour guide application',
			'Your guide application',
			`Hi ${first}, thank you for applying. We are not able to take your application forward at the moment. You are welcome to contact us if you would like to know more.`,
			{ label: 'Contact us', url: `${SITE_URL}/contact` }
		);
	}
	return json({ ok: true });
};
