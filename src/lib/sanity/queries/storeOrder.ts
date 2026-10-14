import { db, unwrap, fromRow } from '$lib/server/supabase';

export interface StoreOrderItemInput {
	id: string; // product slug
	category: 'magazine' | 'merchandise';
	title: string;
	price: number;
	quantity: number;
	variant?: string;
}

export interface StoreOrderInput {
	items: StoreOrderItemInput[];
	subtotal: number;

	name: string;
	email: string;
	customerId?: string;
	shipping?: {
		address: string;
		city: string;
		country: string;
		postcode: string;
	} | null;

	convertedAmount?: number;
	countryCode?: string;
	currencyCode?: string;

	paymentMethod: 'stripe' | 'dlocal' | 'free';
}

export async function createPendingOrder(input: StoreOrderInput) {
	const items = (input.items ?? []).map((item) => ({
		_key: crypto.randomUUID(),
		id: item.id,
		category: item.category,
		title: item.title,
		price: item.price,
		quantity: item.quantity,
		variant: item.variant
	}));

	const row = unwrap(
		await db
			.from('store_orders')
			.insert({
				items,
				subtotal: input.subtotal,
				name: input.name,
				email: input.email.trim().toLowerCase(),
				customer_id: input.customerId ?? null,
				shipping: input.shipping ?? null,
				converted_amount: input.convertedAmount ?? null,
				country_code: input.countryCode ?? null,
				currency_code: input.currencyCode ?? null,
				payment_method: input.paymentMethod,
				payment_status: 'pending',
				confirmation_email_sent: false
			})
			.select('id')
			.single()
	);

	return { _id: row.id as string };
}

export async function markOrderPaid(
	orderId: string,
	details: {
		amountCharged: number;
		currency: string;
		stripePaymentIntentId?: string;
		dlocalPaymentId?: string;
	}
) {
	unwrap(
		await db
			.from('store_orders')
			.update({
				payment_status: 'paid',
				amount_charged: details.amountCharged,
				currency: details.currency,
				stripe_payment_intent_id: details.stripePaymentIntentId ?? null,
				dlocal_payment_id: details.dlocalPaymentId ?? null
			})
			.eq('id', orderId)
	);
}

export async function markOrderEmailSent(orderId: string) {
	unwrap(
		await db
			.from('store_orders')
			.update({
				confirmation_email_sent: true,
				confirmation_email_sent_at: new Date().toISOString()
			})
			.eq('id', orderId)
	);
}

export async function getOrderStatus(orderId: string) {
	const row = unwrap(await db.from('store_orders').select('*').eq('id', orderId).maybeSingle());
	return fromRow(row);
}

// Paid store orders for the logged-in user. Matched by account ID only: an
// email alone is not proof of ownership because signup doesn't verify emails.
export async function getStoreOrdersForCustomer(customerId: string, _email?: string | null) {
	const rows = unwrap(
		await db
			.from('store_orders')
			.select('*')
			.eq('customer_id', customerId)
			.eq('payment_status', 'paid')
			.order('created_at', { ascending: false })
	);

	return (rows ?? []).map((row) => fromRow(row));
}

// One paid store order, only if it belongs to this user.
export async function getStoreOrderByIdForCustomer(
	orderId: string,
	customerId: string,
	_email?: string | null
) {
	const row = unwrap(
		await db
			.from('store_orders')
			.select('*')
			.eq('id', orderId)
			.eq('customer_id', customerId)
			.eq('payment_status', 'paid')
			.maybeSingle()
	);

	return fromRow(row);
}
