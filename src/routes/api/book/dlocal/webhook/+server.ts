import { json } from '@sveltejs/kit';
import { fetchDlocalPayment } from '$lib/server/dlocalVerify';
import { settleBooking, toVerifiedDlocalPayment } from '$lib/server/paymentSettlement';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
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
		const result = await settleBooking(payment.order_id, toVerifiedDlocalPayment(payment));

		if (result === 'not_found') {
			console.error(`Booking ${payment.order_id} was not found.`);
			return json({ error: 'Booking not found.' }, { status: 404 });
		}

		return json({ received: true, result });
	} catch (error) {
		console.error(`Failed processing dLocal payment for booking ${payment.order_id}:`, error);

		// A non-2xx response makes dLocal retry later.
		return json({ error: 'Webhook processing failed.' }, { status: 500 });
	}
};
