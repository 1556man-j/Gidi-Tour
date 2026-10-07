import { sanityClient } from '../client';
import { sanityWriteClient } from '../serverClient';

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

	paymentMethod: 'stripe' | 'dlocal';
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

	return sanityWriteClient.create({
		_type: 'storeOrder',

		items,
		subtotal: input.subtotal,

		name: input.name,
		email: input.email.trim().toLowerCase(),
		customerId: input.customerId ?? null,
		shipping: input.shipping ?? null,

		convertedAmount: input.convertedAmount,
		countryCode: input.countryCode,
		currencyCode: input.currencyCode,

		paymentMethod: input.paymentMethod,

		paymentStatus: 'pending',
		confirmationEmailSent: false,

		createdAt: new Date().toISOString()
	});
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
	return sanityWriteClient
		.patch(orderId)
		.set({
			paymentStatus: 'paid',
			...details
		})
		.commit();
}

export async function markOrderEmailSent(orderId: string) {
	return sanityWriteClient
		.patch(orderId)
		.set({
			confirmationEmailSent: true,
			confirmationEmailSentAt: new Date().toISOString()
		})
		.commit();
}

export async function getOrderStatus(orderId: string) {
	return sanityWriteClient.fetch(
		`*[_type == "storeOrder" && _id == $orderId][0]{
			_id,
			name,
			email,

			items,
			subtotal,

			amountCharged,
			convertedAmount,
			currency,
			currencyCode,
			countryCode,

			shipping,

			paymentMethod,
			paymentStatus,

			confirmationEmailSent,
			confirmationEmailSentAt,

			stripePaymentIntentId,
			dlocalPaymentId,

			createdAt
		}`,
		{ orderId }
	);
}

// Used when building the confirmation email: looks up the real digital file
// for each magazine item in a paid order, by product slug.
export async function getMagazineDownloadFiles(slugs: string[]) {
	if (slugs.length === 0) return [];

	return sanityClient.fetch(
		`*[_type == "storeProduct" && category == "magazine" && slug.current in $slugs]{
			"slug": slug.current,
			title,
			digitalFile
		}`,
		{ slugs }
	);
}

// Paid store orders for the logged-in user, matched by account id or by email.
export async function getStoreOrdersForCustomer(customerId: string, email?: string | null) {
	return sanityWriteClient.fetch(
		`*[
			_type == "storeOrder" &&
			paymentStatus == "paid" &&
			(customerId == $customerId || (defined($email) && lower(email) == $email))
		] | order(createdAt desc){
			_id,
			items,
			subtotal,
			paymentStatus,
			shipping,
			createdAt
		}`,
		{ customerId, email: email?.trim().toLowerCase() ?? null }
	);
}

// One paid store order, only if it belongs to this user.
export async function getStoreOrderByIdForCustomer(
	orderId: string,
	customerId: string,
	email?: string | null
) {
	return sanityWriteClient.fetch(
		`*[
			_type == "storeOrder" &&
			_id == $orderId &&
			paymentStatus == "paid" &&
			(customerId == $customerId || (defined($email) && lower(email) == $email))
		][0]{
			_id,
			name,
			email,
			items,
			subtotal,
			shipping,
			paymentMethod,
			paymentStatus,
			createdAt
		}`,
		{ orderId, customerId, email: email?.trim().toLowerCase() ?? null }
	);
}