import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const bookingId =
		url.searchParams.get('bookingId') ??
		url.searchParams.get('order_id') ??
		url.searchParams.get('orderId');

	if (!bookingId) {
		throw redirect(303, '/book');
	}

	throw redirect(
		303,
		`/book/confirmation?bookingId=${encodeURIComponent(bookingId)}`
	);
};

export const POST: RequestHandler = async ({ request, url }) => {
	const formData = await request.formData();

	const queryBookingId = url.searchParams.get('bookingId');

	const bodyBookingId =
		String(formData.get('bookingId') ?? '') ||
		String(formData.get('order_id') ?? '') ||
		String(formData.get('orderId') ?? '');

	const bookingId = queryBookingId || bodyBookingId;

	if (!bookingId) {
		throw redirect(303, '/book');
	}

	throw redirect(
		303,
		`/book/confirmation?bookingId=${encodeURIComponent(bookingId)}`
	);
};