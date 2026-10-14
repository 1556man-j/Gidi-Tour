import { getBookingStatus } from '$lib/sanity/queries/booking';
import { getOrderStatus } from '$lib/sanity/queries/storeOrder';
import { sendBookingConfirmationEmails } from '$lib/server/bookingEmail';
import { sendStoreOrderConfirmationEmails } from '$lib/server/storeEmail';
import { buildDownloadLinks } from '$lib/server/magazineDownload';
import { fetchDlocalPayment } from '$lib/server/dlocalVerify';
import {
	claimPaid,
	claimEmail,
	releaseEmail,
	markFailed,
	markReview,
	type PaymentTable
} from '$lib/server/paymentRecords';

/**
 * A payment as confirmed by the provider itself (Stripe's signed webhook, or
 * dLocal's own API). The browser returning to the site is never used.
 */
export interface VerifiedPayment {
	provider: 'stripe' | 'dlocal';
	paymentId: string;
	status: 'paid' | 'failed' | 'pending';
	amountMinor: number; // smallest unit, e.g. pence or kobo
	currency: string;
}

export type SettleResult = 'paid' | 'failed' | 'pending' | 'review' | 'not_found';

// The amount and currency saved when the payment was created must equal what was
// actually paid. This guards against any mismatch between what we asked for and
// what the provider collected.
function amountMatches(
	record: { convertedAmount?: number | string; currencyCode?: string },
	payment: VerifiedPayment
) {
	const expected = Number(record.convertedAmount);

	if (!Number.isFinite(expected) || !record.currencyCode) return false;

	return (
		Math.round(expected * 100) === payment.amountMinor &&
		record.currencyCode.toUpperCase() === payment.currency.toUpperCase()
	);
}

function paidDetails(payment: VerifiedPayment) {
	return {
		amountMinor: payment.amountMinor,
		currency: payment.currency.toUpperCase(),
		stripePaymentIntentId: payment.provider === 'stripe' ? payment.paymentId : undefined,
		dlocalPaymentId: payment.provider === 'dlocal' ? payment.paymentId : undefined
	};
}

async function settle(
	table: PaymentTable,
	id: string,
	payment: VerifiedPayment,
	load: (id: string) => Promise<any>,
	sendEmails: (record: any) => Promise<void>
): Promise<SettleResult> {
	const record = await load(id);

	if (!record) return 'not_found';

	if (payment.status === 'failed') {
		await markFailed(table, id);
		return 'failed';
	}

	if (payment.status !== 'paid') return 'pending';

	if (record.paymentStatus !== 'paid') {
		if (!amountMatches(record, payment)) {
			console.error(
				`PAYMENT MISMATCH on ${table} ${id}: expected ${record.convertedAmount} ${record.currencyCode}, ` +
					`provider reports ${payment.amountMinor / 100} ${payment.currency}. Held for review.`
			);
			await markReview(table, id);
			return 'review';
		}

		await claimPaid(table, id, paidDetails(payment));
	}

	// Only one caller can win this, so the customer gets exactly one set of emails.
	if (await claimEmail(table, id)) {
		try {
			await sendEmails(await load(id));
		} catch (error) {
			await releaseEmail(table, id);
			throw error;
		}
	}

	return 'paid';
}

export function settleBooking(bookingId: string, payment: VerifiedPayment) {
	return settle('bookings', bookingId, payment, getBookingStatus, (booking) =>
		sendBookingConfirmationEmails({
			name: booking.name,
			email: booking.email,
			amountGBP: booking.amountGBP,
			amountCharged: booking.amountCharged,
			currency: booking.currency,
			paymentMethod: payment.provider,
			bookingId: booking._id,
			destination: booking.destination,
			startDate: booking.startDate,
			endDate: booking.endDate,
			travelers: booking.travelers,
			tours: booking.tours || []
		})
	);
}

export function settleOrder(orderId: string, payment: VerifiedPayment, origin: string) {
	return settle('store_orders', orderId, payment, getOrderStatus, async (order) => {
		const downloadLinks = await buildDownloadLinks(origin, order);

		await sendStoreOrderConfirmationEmails({
			name: order.name,
			email: order.email,
			orderId: order._id,
			items: order.items || [],
			subtotal: order.subtotal,
			amountCharged: order.amountCharged,
			currency: order.currency,
			paymentMethod: payment.provider,
			shipping: order.shipping,
			downloadLinks
		});
	});
}

// ---------------------------------------------------------------------------
// dLocal helpers
// ---------------------------------------------------------------------------

const DLOCAL_FAILED = ['REJECTED', 'CANCELLED', 'EXPIRED'];

export function toVerifiedDlocalPayment(payment: {
	id: string;
	status: string;
	amount: number;
	currency: string;
}): VerifiedPayment {
	return {
		provider: 'dlocal',
		paymentId: payment.id,
		status:
			payment.status === 'PAID' ? 'paid' : DLOCAL_FAILED.includes(payment.status) ? 'failed' : 'pending',
		amountMinor: Math.round(payment.amount * 100),
		currency: payment.currency
	};
}

/**
 * Called when the customer lands on the confirmation page and the booking is
 * still pending. Asks dLocal directly (server to server), so a late or missing
 * webhook no longer leaves a paid customer stuck on "pending".
 */
export async function reconcileDlocalBooking(booking: any) {
	if (!booking || booking.paymentMethod !== 'dlocal') return booking;
	if (booking.paymentStatus !== 'pending' || !booking.dlocalPaymentId) return booking;

	try {
		const payment = await fetchDlocalPayment(booking.dlocalPaymentId);

		if (payment) await settleBooking(booking._id, toVerifiedDlocalPayment(payment));
	} catch (error) {
		console.error('dLocal booking reconcile failed:', error);
	}

	return (await getBookingStatus(booking._id)) ?? booking;
}

export async function reconcileDlocalOrder(order: any, origin: string) {
	if (!order || order.paymentMethod !== 'dlocal') return order;
	if (order.paymentStatus !== 'pending' || !order.dlocalPaymentId) return order;

	try {
		const payment = await fetchDlocalPayment(order.dlocalPaymentId);

		if (payment) await settleOrder(order._id, toVerifiedDlocalPayment(payment), origin);
	} catch (error) {
		console.error('dLocal order reconcile failed:', error);
	}

	return (await getOrderStatus(order._id)) ?? order;
}
