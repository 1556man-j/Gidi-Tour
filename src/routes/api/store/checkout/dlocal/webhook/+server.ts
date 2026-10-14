import { json } from '@sveltejs/kit';
import { fetchDlocalPayment } from '$lib/server/dlocalVerify';
import { settleOrder, toVerifiedDlocalPayment } from '$lib/server/paymentSettlement';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, url }) => {
	let payload: { id?: string };

	try {
		payload = await request.json();
	} catch {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	if (!payload.id) {
		return json({ error: 'Missing payment id.' }, { status: 400 });
	}

	// Only act on what dLocal itself confirms, never on the request body alone.
	const payment = await fetchDlocalPayment(payload.id);

	if (!payment) {
		return json({ error: 'Could not verify payment with dLocal.' }, { status: 502 });
	}

	try {
		const result = await settleOrder(payment.order_id, toVerifiedDlocalPayment(payment), url.origin);

		if (result === 'not_found') {
			console.error(`Order ${payment.order_id} was not found.`);
			return json({ received: true, warning: 'Order not found.' });
		}

		return json({ received: true, result });
	} catch (error) {
		console.error(`Failed processing dLocal payment for order ${payment.order_id}:`, error);
		return json({ error: 'Webhook processing failed.' }, { status: 500 });
	}
};
