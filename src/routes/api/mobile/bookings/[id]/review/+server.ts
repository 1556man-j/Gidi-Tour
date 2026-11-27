import { json } from '@sveltejs/kit';
import { db, unwrap } from '$lib/server/supabase';
import { getBookingByIdForCustomer } from '$lib/sanity/queries/booking';
import { isRateLimited, ipOf, tooManyRequests } from '$lib/server/rateLimit';
import type { RequestHandler } from './$types';

/** The reviews this person has already left for this booking. */
export const GET: RequestHandler = async ({ locals, params }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });
	const rows = unwrap(await db.from('tour_reviews').select('tour_id,rating,comment,status').eq('booking_id', params.id).eq('customer_id', session.user.id)) as any[];
	return json({ reviews: rows.map((r) => ({ tourId: r.tour_id, rating: r.rating, comment: r.comment, status: r.status })) });
};

/** A traveller reviews a tour from a paid booking whose trip has finished. Reviews wait for approval before they show publicly. */
export const POST: RequestHandler = async ({ locals, params, request, getClientAddress }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });
	if (await isRateLimited(`review:${ipOf(getClientAddress)}`, 20, 3600)) return tooManyRequests();

	const booking: any = await getBookingByIdForCustomer(params.id, session.user.id);
	if (!booking || booking.paymentStatus !== 'paid') return json({ error: 'Booking not found.' }, { status: 404 });

	const end = booking.endDate || booking.startDate;
	if (!end || new Date(end).getTime() > Date.now()) return json({ error: 'You can review once your trip has finished.' }, { status: 400 });

	const body = await request.json().catch(() => null);
	const tourId = typeof body?.tourId === 'string' ? body.tourId : '';
	const rating = Math.floor(Number(body?.rating));
	const comment = typeof body?.comment === 'string' ? body.comment.trim().slice(0, 1500) : '';

	if (!(booking.tours ?? []).some((t: any) => t.id === tourId)) return json({ error: 'That tour is not part of this booking.' }, { status: 400 });
	if (!(rating >= 1 && rating <= 5)) return json({ error: 'Please choose a rating from 1 to 5.' }, { status: 400 });

	const { error } = await db.from('tour_reviews').insert({ booking_id: params.id, customer_id: session.user.id, tour_id: tourId, rating, comment: comment || null });
	if (error) {
		if (error.code === '23505') return json({ error: 'You already reviewed this tour.' }, { status: 409 });
		console.error('Review insert failed:', error.message);
		return json({ error: 'Could not save your review. Please try again.' }, { status: 500 });
	}
	return json({ ok: true, status: 'pending' });
};
