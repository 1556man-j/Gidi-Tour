import { db, unwrap, fromRow } from '$lib/server/supabase';

export interface BookingTour {
	id: string;
	title: string;
	price: number;
	travelers: number;
	image?: string;
}

export interface BookingInput {
	customerId?: string;

	tours: {
		id: string;
		title: string;
		price: number;
		travelers: number;
		image?: string;
		customerId?: string;
	}[];

	tourIds?: string[];

	destination?: string;
	tripType?: string;
	startDate?: string;
	endDate?: string;
	flexibleDates?: string;
	travelers?: number;
	addOns?: string[];
	customAddOn?: string;

	name: string;
	email: string;
	phone?: string;
	travelingFrom?: string;
	notes?: string;

	amountGBP: number;
	convertedAmount?: number;
	estimatedTotal?: number;

	countryCode?: string;
	currencyCode?: string;

	paymentMethod: 'stripe' | 'dlocal';
}

export async function createPendingBooking(input: BookingInput) {
	const tours = (input.tours ?? []).map((tour) => ({
		_key: crypto.randomUUID(),
		id: tour.id,
		title: tour.title,
		price: tour.price,
		travelers: tour.travelers,
		image: tour.image
	}));

	const row = unwrap(
		await db
			.from('bookings')
			.insert({
				customer_id: input.customerId ?? null,
				tours,
				tour_ids: input.tourIds ?? [],
				destination: input.destination ?? null,
				trip_type: input.tripType ?? null,
				start_date: input.startDate ?? null,
				end_date: input.endDate ?? null,
				flexible_dates: input.flexibleDates ?? null,
				travelers: input.travelers ?? null,
				add_ons: input.addOns ?? [],
				custom_add_on: input.customAddOn ?? null,
				name: input.name,
				email: input.email,
				phone: input.phone ?? null,
				traveling_from: input.travelingFrom ?? null,
				notes: input.notes ?? null,
				amount_gbp: input.amountGBP,
				converted_amount: input.convertedAmount ?? null,
				estimated_total: input.estimatedTotal ?? null,
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

export async function markBookingPaid(
	bookingId: string,
	details: {
		amountCharged: number;
		currency: string;
		stripePaymentIntentId?: string;
		stripeCheckoutSessionId?: string;
		dlocalPaymentId?: string;
		dlocalTransactionId?: string;
	}
) {
	unwrap(
		await db
			.from('bookings')
			.update({
				payment_status: 'paid',
				amount_charged: details.amountCharged,
				currency: details.currency,
				stripe_payment_intent_id: details.stripePaymentIntentId ?? null,
				dlocal_payment_id: details.dlocalPaymentId ?? null
			})
			.eq('id', bookingId)
	);
}

export async function markBookingEmailSent(bookingId: string) {
	unwrap(
		await db
			.from('bookings')
			.update({
				confirmation_email_sent: true,
				confirmation_email_sent_at: new Date().toISOString()
			})
			.eq('id', bookingId)
	);
}

// Always reads straight from the database, so the confirmation page and the
// webhooks never see a cached "pending".
export async function getBookingStatus(bookingId: string) {
	const row = unwrap(await db.from('bookings').select('*').eq('id', bookingId).maybeSingle());
	return fromRow(row);
}

export async function getBookingsForCustomer(customerId: string) {
	const rows = unwrap(
		await db
			.from('bookings')
			.select('*')
			.eq('customer_id', customerId)
			.order('created_at', { ascending: false })
	);

	return (rows ?? []).map((row) => fromRow(row));
}

export async function getBookingByIdForCustomer(bookingId: string, customerId: string) {
	// The customer_id check means nobody can view another person's booking by guessing an ID.
	const row = unwrap(
		await db
			.from('bookings')
			.select('*')
			.eq('id', bookingId)
			.eq('customer_id', customerId)
			.maybeSingle()
	);

	return fromRow(row);
}
