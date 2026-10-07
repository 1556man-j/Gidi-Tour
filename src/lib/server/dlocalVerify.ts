import { dlocalHeaders, DLOCAL_API_BASE } from '$lib/server/dlocalClient';

// Asks dLocal itself for the payment, so a fake webhook request can't mark an
// order as paid. Returns null if dLocal can't confirm the payment.
export async function fetchDlocalPayment(paymentId: string) {
	try {
		const res = await fetch(`${DLOCAL_API_BASE}/payments/${encodeURIComponent(paymentId)}`, {
			method: 'GET',
			headers: dlocalHeaders('')
		});

		if (!res.ok) {
			console.error('dLocal payment lookup failed:', res.status, await res.text());
			return null;
		}

		return (await res.json()) as {
			id: string;
			status: string;
			order_id: string;
			amount: number;
			currency: string;
		};
	} catch (error) {
		console.error('dLocal payment lookup error:', error);
		return null;
	}
}