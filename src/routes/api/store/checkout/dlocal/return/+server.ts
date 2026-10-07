import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

function toConfirmation(orderId: string | null | undefined): never {
	if (!orderId) {
		throw redirect(303, '/store');
	}
	throw redirect(303, `/store/confirmation?orderId=${encodeURIComponent(orderId)}`);
}

export const GET: RequestHandler = async ({ url }) => {
	return toConfirmation(url.searchParams.get('orderId') ?? url.searchParams.get('order_id'));
};

export const POST: RequestHandler = async ({ request, url }) => {
	let bodyOrderId = '';

	try {
		const formData = await request.formData();
		bodyOrderId =
			String(formData.get('orderId') ?? '') || String(formData.get('order_id') ?? '');
	} catch {
		// Not a form body, fall back to the query string below.
	}

	return toConfirmation(url.searchParams.get('orderId') || bodyOrderId);
};