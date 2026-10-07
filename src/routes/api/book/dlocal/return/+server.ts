import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

function toConfirmation(bookingId: string | null | undefined): never {
	if (!bookingId) {
		throw redirect(303, '/book');
	}
	throw redirect(303, `/book/confirmation?bookingId=${encodeURIComponent(bookingId)}`);
}

export const GET: RequestHandler = async ({ url }) => {
	return toConfirmation(
		url.searchParams.get('bookingId') ??
			url.searchParams.get('order_id') ??
			url.searchParams.get('orderId')
	);
};

export const POST: RequestHandler = async ({ request, url }) => {
	let bodyBookingId = '';

	try {
		const formData = await request.formData();
		bodyBookingId =
			String(formData.get('bookingId') ?? '') ||
			String(formData.get('order_id') ?? '') ||
			String(formData.get('orderId') ?? '');
	} catch {
		// Not a form body, fall back to the query string below.
	}

	return toConfirmation(url.searchParams.get('bookingId') || bodyBookingId);
};