import { sanityClient } from '../client';
import { sanityWriteClient } from '../serverClient';

export interface BookingTour {
	id: string;
	title: string;
	price: number;
	travelers: number;
	image?: string;
}

export interface BookingInput {
	tours: {
		id: string;
		title: string;
		price: number;
		travelers: number;
		image?: string;
	}[];

	tourIds?: string[];

	destination?: string;
	tripType?: string;
	startDate?: string;
	endDate?: string;
	flexibleDates?: string;
	travelers?: number;
	addOns?: string[];

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

	return sanityWriteClient.create({
		_type: 'booking',
		tours,
		destination: input.destination,
		tripType: input.tripType,
		startDate: input.startDate,
		endDate: input.endDate,
		flexibleDates: input.flexibleDates,
		travelers: input.travelers,
		addOns: input.addOns,
		name: input.name,
		email: input.email,
		phone: input.phone,
		travelingFrom: input.travelingFrom,
		notes: input.notes,
		amountGBP: input.amountGBP,
		convertedAmount: input.convertedAmount,
		currencyCode: input.currencyCode,
		paymentMethod: input.paymentMethod,

		paymentStatus: 'pending',
		confirmationEmailSent: false,

		createdAt: new Date().toISOString()
	});
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
	return sanityWriteClient
		.patch(bookingId)
		.set({
			paymentStatus: 'paid',
			...details
		})
		.commit();
}

export async function markBookingEmailSent(bookingId: string) {
	return sanityWriteClient
		.patch(bookingId)
		.set({
			confirmationEmailSent: true,
			confirmationEmailSentAt: new Date().toISOString()
		})
		.commit();
}

export async function getBookingStatus(bookingId: string) {
	return sanityClient.fetch(
		`*[_type == "booking" && _id == $bookingId][0]{
			_id,
			name,
			email,
			amountGBP,
			amountCharged,
			currency,
			currencyCode,
			paymentMethod,
			paymentStatus,
			confirmationEmailSent,
			destination,
			tripType,
			startDate,
			endDate,
			flexibleDates,
			travelers,
			addOns,
			phone,
			travelingFrom,
			notes,
			tours
		}`,
		{ bookingId }
	);
}
