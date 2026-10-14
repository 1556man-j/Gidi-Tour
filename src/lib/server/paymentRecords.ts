import { db, unwrap } from '$lib/server/supabase';

export type PaymentTable = 'bookings' | 'store_orders';

/**
 * Moves a record to "paid". Only the first caller gets `true`; a repeated
 * webhook, or a webhook racing the confirmation page, gets `false`.
 */
export async function claimPaid(
	table: PaymentTable,
	id: string,
	details: {
		amountMinor: number;
		currency: string;
		stripePaymentIntentId?: string;
		dlocalPaymentId?: string;
	}
): Promise<boolean> {
	const update: Record<string, unknown> = {
		payment_status: 'paid',
		amount_charged: details.amountMinor,
		currency: details.currency
	};

	if (details.stripePaymentIntentId) update.stripe_payment_intent_id = details.stripePaymentIntentId;
	if (details.dlocalPaymentId) update.dlocal_payment_id = details.dlocalPaymentId;

	const rows = unwrap(
		await db.from(table).update(update).eq('id', id).neq('payment_status', 'paid').select('id')
	);

	return (rows?.length ?? 0) > 0;
}

/**
 * Reserves the right to send the confirmation emails. Only one caller can win,
 * so a retried webhook can no longer send the customer two emails.
 */
export async function claimEmail(table: PaymentTable, id: string): Promise<boolean> {
	const rows = unwrap(
		await db
			.from(table)
			.update({ confirmation_email_sent: true, confirmation_email_sent_at: new Date().toISOString() })
			.eq('id', id)
			.eq('payment_status', 'paid')
			.eq('confirmation_email_sent', false)
			.select('id')
	);

	return (rows?.length ?? 0) > 0;
}

/** Gives the email slot back if sending failed, so the next retry can try again. */
export async function releaseEmail(table: PaymentTable, id: string) {
	unwrap(
		await db
			.from(table)
			.update({ confirmation_email_sent: false, confirmation_email_sent_at: null })
			.eq('id', id)
	);
}

/** Pending -> failed. Never touches a record that is already paid. */
export async function markFailed(table: PaymentTable, id: string) {
	unwrap(
		await db.from(table).update({ payment_status: 'failed' }).eq('id', id).eq('payment_status', 'pending')
	);
}

/** The provider says "paid" but the amount or currency is wrong: hold it for a human. */
export async function markReview(table: PaymentTable, id: string) {
	unwrap(
		await db.from(table).update({ payment_status: 'review' }).eq('id', id).neq('payment_status', 'paid')
	);
}

/** Remembers the dLocal payment so the confirmation page can ask dLocal about it. */
export async function setDlocalPaymentId(table: PaymentTable, id: string, paymentId: string) {
	unwrap(await db.from(table).update({ dlocal_payment_id: paymentId }).eq('id', id));
}

/** Stripe refund or dispute: flag the paid record (this also stops magazine downloads). */
export async function markByStripeIntent(
	paymentIntentId: string,
	status: 'refunded' | 'disputed'
) {
	for (const table of ['bookings', 'store_orders'] as const) {
		unwrap(
			await db
				.from(table)
				.update({ payment_status: status })
				.eq('stripe_payment_intent_id', paymentIntentId)
				.eq('payment_status', 'paid')
		);
	}
}
