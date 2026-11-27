import { db } from '$lib/server/supabase';
import { isRateLimited } from '$lib/server/rateLimit';
import { sendSimpleEmail } from '$lib/server/simpleEmail';
import type { ConversationRow, Role } from '$lib/server/chat';

/**
 * Emails the other person that a new message is waiting. The message itself is never put in the email.
 * At most one email per chat per person every 15 minutes, so a busy chat does not flood an inbox.
 */
export async function notifyNewMessage(conv: ConversationRow, senderRole: Role) {
	const toRole: Role = senderRole === 'traveller' ? 'guide' : 'traveller';
	if (await isRateLimited(`chat-notify:${conv.id}:${toRole}`, 1, 900)) return;

	let email: string | null = null;
	let name: string | null = null;
	if (toRole === 'guide') {
		email = conv.guide_email;
		name = conv.guide_name;
	} else {
		const { data } = await db.from('customers').select('email, name').eq('id', conv.customer_id).maybeSingle();
		email = data?.email ?? null;
		name = data?.name ?? null;
	}
	if (!email || email.endsWith('.invalid')) return;

	const first = (name ?? '').split(' ')[0] || 'there';
	const about = conv.tour_titles ? ` about ${conv.tour_titles}` : '';
	await sendSimpleEmail(
		email,
		'You have a new message on Gidi Tour',
		'You have a new message',
		toRole === 'guide'
			? `Hi ${first}, a traveller${about} sent you a message. Open the Gidi Tour app and go to your Inbox to reply.`
			: `Hi ${first}, your guide${about} sent you a message. Open the Gidi Tour app and go to Messages to reply.`
	);
}
