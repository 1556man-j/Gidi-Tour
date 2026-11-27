import { db, unwrap } from '$lib/server/supabase';
import { getGuideByEmail, getGuidesForTours } from '$lib/sanity/queries/guides';
import { checkMessage } from '$lib/server/chatFilter';
import { notifyNewMessage } from '$lib/server/chatNotify';

const CLOSE_AFTER_DAYS = 7; // chats stay open this long after the tour ends
const MAX_BODY = 1000;

export type Role = 'traveller' | 'guide';

export interface ConversationRow {
	id: string;
	booking_id: string;
	customer_id: string;
	customer_first_name: string | null;
	guide_sanity_id: string | null;
	guide_email: string | null;
	guide_name: string | null;
	guide_photo_url: string | null;
	tour_titles: string | null;
	destination: string | null;
	start_date: string | null;
	end_date: string | null;
	closes_at: string | null;
	last_message_at: string | null;
	last_message_preview: string | null;
	created_at: string;
}

const isClosed = (c: ConversationRow) => !!c.closes_at && new Date(c.closes_at).getTime() < Date.now();

/** What the app sees. Contact details are never included. */
export function publicConversation(c: ConversationRow, role: Role, unread = 0) {
	return {
		id: c.id,
		bookingId: c.booking_id,
		role,
		closed: isClosed(c),
		waitingForGuide: !c.guide_email,
		guide: c.guide_email ? { name: c.guide_name, photoUrl: c.guide_photo_url } : null,
		traveller: { firstName: c.customer_first_name },
		trip: { tours: c.tour_titles, destination: c.destination, startDate: c.start_date, endDate: c.end_date },
		lastMessageAt: c.last_message_at,
		lastMessagePreview: c.last_message_preview,
		unread
	};
}

/** Picks the guide with the fewest open chats among the guides who lead these tours. */
async function pickGuide(slugs: string[]) {
	const guides = await getGuidesForTours(slugs);
	if (!guides.length) return null;

	const { data } = await db
		.from('conversations')
		.select('guide_sanity_id')
		.in('guide_sanity_id', guides.map((g) => g._id))
		.gt('closes_at', new Date().toISOString());

	const load = new Map<string, number>();
	for (const row of data ?? []) load.set(row.guide_sanity_id, (load.get(row.guide_sanity_id) ?? 0) + 1);

	return [...guides].sort((a, b) => (load.get(a._id) ?? 0) - (load.get(b._id) ?? 0))[0];
}

/**
 * Creates the chat for a PAID booking (or fills in the guide if none was available last time).
 * Safe to call again and again. Returns null if the booking is not paid or does not exist.
 */
export async function ensureConversationForBooking(bookingId: string): Promise<ConversationRow | null> {
	const booking = unwrap(await db.from('bookings').select('*').eq('id', bookingId).maybeSingle());
	if (!booking || booking.payment_status !== 'paid' || !booking.customer_id) return null;

	let conv = unwrap(
		await db.from('conversations').select('*').eq('booking_id', bookingId).maybeSingle()
	) as ConversationRow | null;

	if (conv?.guide_email) return conv;

	const tours: { id: string; title: string }[] = Array.isArray(booking.tours) ? booking.tours : [];
	const guide = await pickGuide(tours.map((t) => t.id).filter(Boolean));

	let guidePhoto = guide?.photoUrl ?? null;
	if (guide && !guidePhoto) {
		// Guides who applied in the app use their account photo.
		const { data } = await db.from('customers').select('avatar_url').eq('email', guide.email).maybeSingle();
		guidePhoto = data?.avatar_url ?? null;
	}

	const guideFields = guide
		? { guide_sanity_id: guide._id, guide_email: guide.email, guide_name: guide.name, guide_photo_url: guidePhoto }
		: {};

	if (conv) {
		if (!guide) return conv;
		return unwrap(
			await db.from('conversations').update(guideFields).eq('id', conv.id).select('*').single()
		) as ConversationRow;
	}

	const end = booking.end_date ? new Date(booking.end_date) : new Date();
	const closesAt = new Date(end.getTime() + CLOSE_AFTER_DAYS * 86_400_000).toISOString();

	// Trips that ended long ago (paid before chat existed) don't get a chat.
	if (new Date(closesAt).getTime() < Date.now()) return null;

	const { data, error } = await db
		.from('conversations')
		.insert({
			booking_id: bookingId,
			customer_id: booking.customer_id,
			customer_first_name: String(booking.name ?? '').trim().split(/\s+/)[0] || null,
			tour_titles: tours.map((t) => t.title).join(', ') || null,
			destination: booking.destination ?? null,
			start_date: booking.start_date ?? null,
			end_date: booking.end_date ?? null,
			closes_at: closesAt,
			...guideFields
		})
		.select('*')
		.single();

	if (error) {
		// Two requests can race to create the same chat; the loser just reads the winner's row.
		if (error.code === '23505') {
			return unwrap(await db.from('conversations').select('*').eq('booking_id', bookingId).single()) as ConversationRow;
		}
		throw new Error(error.message);
	}

	return data as ConversationRow;
}

export interface Me {
	id: string;
	email: string;
}

/** Which side of this conversation the signed-in person is on, or null if neither. */
export async function roleIn(conv: ConversationRow, me: Me): Promise<Role | null> {
	if (conv.customer_id === me.id) return 'traveller';
	if (conv.guide_email && conv.guide_email === me.email.trim().toLowerCase()) {
		// The guide must still be active in Sanity.
		return (await getGuideByEmail(me.email)) ? 'guide' : null;
	}
	return null;
}

export async function getConversation(id: string) {
	return (await db.from('conversations').select('*').eq('id', id).maybeSingle()).data as ConversationRow | null;
}

async function unreadCounts(ids: string[], role: Role) {
	const counts = new Map<string, number>();
	if (!ids.length) return counts;
	const other: Role = role === 'guide' ? 'traveller' : 'guide';
	const { data } = await db
		.from('messages')
		.select('conversation_id')
		.in('conversation_id', ids)
		.eq('sender_role', other)
		.is('read_at', null);
	for (const row of data ?? []) counts.set(row.conversation_id, (counts.get(row.conversation_id) ?? 0) + 1);
	return counts;
}

/** Everything the signed-in person can see: their own trips, plus the guide inbox if they are a guide. */
export async function listForUser(me: Me) {
	// Retry guide assignment for paid bookings that are still waiting for one.
	const waiting = (
		await db.from('conversations').select('booking_id').eq('customer_id', me.id).is('guide_email', null)
	).data;
	for (const w of waiting ?? []) await ensureConversationForBooking(w.booking_id).catch(() => null);

	// Paid bookings with no chat yet (for example paid before this feature existed).
	const paid = (
		await db.from('bookings').select('id').eq('customer_id', me.id).eq('payment_status', 'paid')
	).data;
	if (paid?.length) {
		const have = new Set(
			((await db.from('conversations').select('booking_id').in('booking_id', paid.map((p) => p.id))).data ?? []).map(
				(c) => c.booking_id
			)
		);
		for (const p of paid) if (!have.has(p.id)) await ensureConversationForBooking(p.id).catch(() => null);
	}

	const mine = ((await db
		.from('conversations')
		.select('*')
		.eq('customer_id', me.id)
		.order('last_message_at', { ascending: false, nullsFirst: false })).data ?? []) as ConversationRow[];

	const guide = await getGuideByEmail(me.email);
	const asGuide = guide
		? (((await db
				.from('conversations')
				.select('*')
				.eq('guide_email', guide.email)
				.order('last_message_at', { ascending: false, nullsFirst: false })).data ?? []) as ConversationRow[])
		: [];

	const [mineUnread, guideUnread] = await Promise.all([
		unreadCounts(mine.map((c) => c.id), 'traveller'),
		unreadCounts(asGuide.map((c) => c.id), 'guide')
	]);

	return {
		isGuide: !!guide,
		guide: guide ? { name: guide.name, photoUrl: guide.photoUrl ?? null } : null,
		trips: mine.map((c) => publicConversation(c, 'traveller', mineUnread.get(c.id) ?? 0)),
		inbox: asGuide.map((c) => publicConversation(c, 'guide', guideUnread.get(c.id) ?? 0))
	};
}

export async function readMessages(conv: ConversationRow, role: Role, after?: string) {
	let q = db.from('messages').select('id, sender_role, body, created_at, read_at').eq('conversation_id', conv.id);
	if (after) q = q.gt('created_at', after);
	const { data } = await q.order('created_at', { ascending: true }).limit(200);

	// Opening the chat marks the other person's messages as read.
	const other: Role = role === 'guide' ? 'traveller' : 'guide';
	await db
		.from('messages')
		.update({ read_at: new Date().toISOString() })
		.eq('conversation_id', conv.id)
		.eq('sender_role', other)
		.is('read_at', null);

	return (data ?? []).map((m) => ({
		id: m.id,
		mine: m.sender_role === role,
		body: m.body,
		createdAt: m.created_at,
		read: !!m.read_at
	}));
}

export type SendResult =
	| { ok: true; message: { id: string; mine: true; body: string; createdAt: string; read: false } }
	| { ok: false; status: number; error: string; blocked?: boolean };

export async function sendMessage(conv: ConversationRow, role: Role, senderId: string, rawBody: string): Promise<SendResult> {
	const body = rawBody.replace(/\s+\n/g, '\n').trim();
	if (!body) return { ok: false, status: 400, error: 'Type a message first.' };
	if (body.length > MAX_BODY) return { ok: false, status: 400, error: `Messages can be up to ${MAX_BODY} characters.` };
	if (isClosed(conv)) return { ok: false, status: 409, error: 'This chat has ended.' };
	if (!conv.guide_email) return { ok: false, status: 409, error: 'A guide has not been assigned yet.' };

	const verdict = checkMessage(body);
	if (!verdict.ok) {
		// Kept for the team to review. Nothing is delivered to the other person.
		await db.from('chat_flags').insert({
			kind: 'blocked',
			conversation_id: conv.id,
			sender_role: role,
			sender_id: senderId,
			body,
			reason: verdict.reason
		});
		return { ok: false, status: 422, blocked: true, error: verdict.message };
	}

	const row = unwrap(
		await db
			.from('messages')
			.insert({ conversation_id: conv.id, sender_role: role, sender_id: senderId, body })
			.select('id, created_at')
			.single()
	);
	if (!row) return { ok: false, status: 500, error: 'Could not send your message. Please try again.' };

	await db
		.from('conversations')
		.update({ last_message_at: row.created_at, last_message_preview: body.slice(0, 80) })
		.eq('id', conv.id);

	// A failed email must never stop the message from being sent.
	try {
		await notifyNewMessage(conv, role);
	} catch (error) {
		console.error('Could not send the new-message email:', error);
	}

	return { ok: true, message: { id: row.id, mine: true, body, createdAt: row.created_at, read: false } };
}

export async function reportMessage(messageId: string, me: Me) {
	const msg = (await db.from('messages').select('id, body, sender_role, sender_id, conversation_id').eq('id', messageId).maybeSingle()).data;
	if (!msg) return { ok: false as const, status: 404, error: 'Message not found.' };

	const conv = await getConversation(msg.conversation_id);
	if (!conv || !(await roleIn(conv, me))) return { ok: false as const, status: 404, error: 'Message not found.' };

	await db.from('chat_flags').insert({
		kind: 'reported',
		conversation_id: conv.id,
		message_id: msg.id,
		sender_role: msg.sender_role,
		sender_id: msg.sender_id,
		body: msg.body,
		reported_by: me.id
	});
	return { ok: true as const };
}
