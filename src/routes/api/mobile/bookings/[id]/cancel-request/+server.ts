import { json } from '@sveltejs/kit';
import { db, unwrap } from '$lib/server/supabase';
import { getBookingByIdForCustomer } from '$lib/sanity/queries/booking';
import { sendSimpleEmail } from '$lib/server/simpleEmail';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

const SUPPORT = 'support@giditour.com';

/**
 * A traveller asks to cancel a paid, upcoming booking. This does NOT refund anything:
 * it records the request and emails the team, who decide under the cancellation and refund policy.
 */
export const POST: RequestHandler = async ({ locals, params, request, getClientAddress }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });
	if (await isRateLimited(`cancel-req:${ipOf(getClientAddress)}`, 10, 3600)) return tooManyRequests();

	const booking: any = await getBookingByIdForCustomer(params.id, session.user.id);
	if (!booking) return json({ error: 'Booking not found.' }, { status: 404 });
	if (booking.paymentStatus !== 'paid') return json({ error: 'Only paid bookings can have a cancellation request.' }, { status: 400 });
	if (booking.startDate && new Date(booking.startDate).getTime() < Date.now()) {
		return json({ error: 'This trip has already started, so it can’t be cancelled here. Please contact us.' }, { status: 400 });
	}

	const body = await request.json().catch(() => null);
	const reason = typeof body?.reason === 'string' ? body.reason.trim().slice(0, 1000) : '';

	const { error } = await db.from('cancel_requests').insert({ booking_id: params.id, customer_id: session.user.id, reason: reason || null });
	if (error) {
		if (error.code === '23505') return json({ error: 'You already have an open cancellation request for this booking.' }, { status: 409 });
		console.error('Cancel request failed:', error.message);
		return json({ error: 'Could not send your request. Please try again.' }, { status: 500 });
	}

	const ref = params.id.slice(-8).toUpperCase();
	try {
		await sendSimpleEmail(SUPPORT, `Cancellation request · ${ref}`, 'New cancellation request',
			`${booking.name} (${booking.email}) asked to cancel booking ${ref} for ${booking.destination ?? 'a tour'} starting ${booking.startDate ?? 'an unspecified date'}. Reason: ${reason || 'not given'}.`);
		if (booking.email) {
			await sendSimpleEmail(booking.email, 'We got your cancellation request', 'We’re looking at it',
				`We received your request to cancel booking ${ref}. Our team will reply within 2 working days. Any refund follows our cancellation and refund policy.`,
				{ label: 'Read the policy', url: 'https://www.giditour.com/cancellation-refund' });
		}
	} catch (e) {
		console.error('Cancel request email failed:', e);
	}
	return json({ ok: true });
};

export const GET: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });
	const rows = unwrap(await db.from('cancel_requests').select('status,created_at').eq('booking_id', params.id).eq('customer_id', session.user.id).order('created_at', { ascending: false }).limit(1)) as any[];
	return json({ request: rows[0] ? { status: rows[0].status, createdAt: rows[0].created_at } : null });
};
