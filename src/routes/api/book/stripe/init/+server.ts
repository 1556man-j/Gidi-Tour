import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { createPendingBooking } from '$lib/sanity/queries/booking';
import {
	buildVerifiedBooking,
	BookingValidationError,
	paymentMethodTypesFor
} from '$lib/server/bookingPricing';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
	try {
		const body = await request.json();

		const session = await locals.auth();
		const customerId = session?.user?.id;

		const countryCode = cookies.get('visitor_country') ?? 'GB';
		const verified = await buildVerifiedBooking(body, countryCode);

		const currencyCode = verified.currencyCode.toLowerCase();

		// Create the booking in Sanity as pending, using the verified values
		const booking = await createPendingBooking({
			...verified,
			currencyCode,
			customerId,
			paymentMethod: 'stripe'
		});

		console.log('Created pending booking:', booking._id);
		console.log('Customer ID:', customerId);

		// Stripe expects the smallest currency unit.
		const amountInMinorUnits = Math.round(verified.convertedAmount * 100);

		if (amountInMinorUnits <= 0) {
			return json({ error: 'Invalid Stripe payment amount.' }, { status: 400 });
		}

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInMinorUnits,
			currency: currencyCode,

			metadata: {
				bookingId: booking._id,
				customerId: customerId ?? ''
			},

			payment_method_types: paymentMethodTypesFor(currencyCode),

			receipt_email: verified.email
		});

		console.log('Created Stripe PaymentIntent:', paymentIntent.id);
		console.log('Booking ID:', booking._id);

		return json({
			clientSecret: paymentIntent.client_secret,
			bookingId: booking._id,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		if (error instanceof BookingValidationError) {
			return json({ error: error.message }, { status: 400 });
		}

		console.error('Stripe booking initialization failed:', error);

		return json({ error: 'Could not start your payment. Please try again.' }, { status: 500 });
	}
};