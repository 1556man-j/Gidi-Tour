import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const orderId =
		url.searchParams.get('orderId') ??
		url.searchParams.get('order_id');

	if (!orderId) {
		throw redirect(303, '/store');
	}

	throw redirect(
		303,
		`/store?orderId=${encodeURIComponent(orderId)}`
	);
};

export const POST: RequestHandler = async ({ request, url }) => {
	const formData = await request.formData();

	const queryOrderId =
		url.searchParams.get('orderId') ??
		url.searchParams.get('order_id');

	const bodyOrderId =
		String(formData.get('orderId') ?? '') ||
		String(formData.get('order_id') ?? '');

	const orderId = queryOrderId || bodyOrderId;

	if (!orderId) {
		throw redirect(303, '/store');
	}

	throw redirect(
		303,
		`/store?orderId=${encodeURIComponent(orderId)}`
	);
};