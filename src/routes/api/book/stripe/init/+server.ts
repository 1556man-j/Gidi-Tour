import { json } from '@sveltejs/kit';
import { stripe } from '$lib/server/stripeClient';
import { createPendingBooking } from '$lib/sanity/queries/booking';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const body = await request.json();

		const session = await locals.auth();
		const customerId = session?.user?.id;

		if (
			!body.name ||
			!body.email ||
			!body.amountGBP ||
			!body.convertedAmount ||
			!body.currencyCode
		) {
			return json({ error: 'Missing required booking fields.' }, { status: 400 });
		}

		if (typeof body.amountGBP !== 'number' || typeof body.convertedAmount !== 'number') {
			return json({ error: 'Invalid booking amount.' }, { status: 400 });
		}

		if (body.convertedAmount <= 0) {
			return json({ error: 'Booking amount must be greater than zero.' }, { status: 400 });
		}

		// Create the booking in Sanity as pending
		const booking = await createPendingBooking({
			customerId,

			tours: body.tours ?? [],
			destination: body.destination,
			tripType: body.tripType,
			startDate: body.startDate,
			endDate: body.endDate,
			flexibleDates: body.flexibleDates,
			travelers: body.travelers,
			addOns: body.addOns,

			name: body.name.trim(),
			email: body.email.trim().toLowerCase(),
			phone: body.phone,
			travelingFrom: body.travelingFrom,
			notes: body.notes,

			amountGBP: body.amountGBP,
			convertedAmount: body.convertedAmount,

			currencyCode: body.currencyCode.toLowerCase(),

			paymentMethod: 'stripe'
		});

		console.log('Created pending booking:', booking._id);
		console.log('Customer ID:', customerId);

		// Stripe expects the smallest currency unit.
		const amountInMinorUnits = Math.round(body.convertedAmount * 100);

		if (amountInMinorUnits <= 0) {
			return json({ error: 'Invalid Stripe payment amount.' }, { status: 400 });
		}

		// Create Stripe PaymentIntent
		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInMinorUnits,
			currency: body.currencyCode.toLowerCase(),

			metadata: {
				bookingId: booking._id,
				customerId: customerId ?? ''
			},

			automatic_payment_methods: {
				enabled: true,
				allow_redirects: 'always'
			},

			receipt_email: body.email.trim().toLowerCase()
		});

		console.log('Created Stripe PaymentIntent:', paymentIntent.id);
		console.log('Booking ID:', booking._id);

		return json({
			clientSecret: paymentIntent.client_secret,
			bookingId: booking._id,
			paymentIntentId: paymentIntent.id
		});
	} catch (error) {
		console.error('Stripe booking initialization failed:', error);

		return json(
			{
				error: 'Could not start your payment. Please try again.'
			},
			{ status: 500 }
		);
	}
};