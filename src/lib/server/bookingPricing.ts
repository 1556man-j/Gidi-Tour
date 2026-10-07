import { sanityClient } from '$lib/sanity/client';
import { getVisitorCurrency } from '$lib/server/geoCurrency';

// If your Sanity tour document type is not called "tour", change it in the query below.

const TRIP_TYPES = ['solo', 'couple', 'family', 'group', 'private'];
const ADD_ONS = ['transfers', 'accommodation', 'food', 'photo', 'special', 'custom'];
const MAX_TRAVELERS = 50;

// PayPal on Stripe only works for some currencies. Check Stripe's docs and edit if needed.
const PAYPAL_CURRENCIES = [
	'aud',
	'cad',
	'chf',
	'czk',
	'dkk',
	'eur',
	'gbp',
	'nok',
	'nzd',
	'pln',
	'sek',
	'usd'
];

export function paymentMethodTypesFor(currencyCode: string): ('card' | 'paypal')[] {
	return PAYPAL_CURRENCIES.includes(currencyCode.toLowerCase()) ? ['card', 'paypal'] : ['card'];
}

export class BookingValidationError extends Error {}

function cleanText(value: unknown, max: number): string {
	return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function cleanCount(value: unknown): number {
	const n = Math.floor(Number(value));
	return Number.isFinite(n) ? Math.min(Math.max(n, 1), MAX_TRAVELERS) : 1;
}

function isValidDate(value: string): boolean {
	return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/**
 * Takes what the browser sent and returns a booking the server can trust.
 * Prices come from Sanity, the converted amount and currency are worked out
 * here, and nothing amount-related from the browser is used.
 */
export async function buildVerifiedBooking(body: any, countryCode: string) {
	const name = cleanText(body?.name, 120);
	const email = cleanText(body?.email, 200).toLowerCase();

	if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		throw new BookingValidationError('Please enter a valid name and email address.');
	}

	const startDate = cleanText(body?.startDate, 10);
	const endDate = cleanText(body?.endDate, 10);

	if (
		!isValidDate(startDate) ||
		!isValidDate(endDate) ||
		new Date(endDate).getTime() < new Date(startDate).getTime()
	) {
		throw new BookingValidationError('Please enter valid travel dates.');
	}

	const requested: any[] = Array.isArray(body?.tours) ? body.tours : [];

	if (requested.length === 0 || requested.length > 20) {
		throw new BookingValidationError('Please select at least one tour to pay for.');
	}

	const slugs = [...new Set(requested.map((t) => cleanText(t?.id, 200)).filter(Boolean))];

	const found = await sanityClient.fetch<{ id: string; title: string; price: number }[]>(
		`*[_type == "tour" && slug.current in $slugs]{ "id": slug.current, title, price }`,
		{ slugs }
	);

	const bySlug = new Map(found.map((t) => [t.id, t]));
	const seen = new Set<string>();

	const tours: {
		id: string;
		title: string;
		price: number;
		travelers: number;
		image?: string;
	}[] = [];

	for (const raw of requested) {
		const id = cleanText(raw?.id, 200);
		if (seen.has(id)) continue;
		seen.add(id);

		const tour = bySlug.get(id);

		if (!tour || typeof tour.price !== 'number' || tour.price <= 0) {
			throw new BookingValidationError('One of your selected tours is no longer available.');
		}

		tours.push({
			id: tour.id,
			title: tour.title,
			price: tour.price,
			travelers: cleanCount(raw?.travelers),
			image:
				typeof raw?.image === 'string' && raw.image.startsWith('https://cdn.sanity.io/')
					? raw.image
					: undefined
		});
	}

	const totalGBP =
		Math.round(tours.reduce((sum, t) => sum + t.price * t.travelers, 0) * 100) / 100;

	// Same conversion and rounding as the page the customer saw.
	const { currency, rate } = await getVisitorCurrency(countryCode);
	const convertedAmount = rate !== null ? Math.round(totalGBP * rate) : totalGBP;

	if (convertedAmount <= 0) {
		throw new BookingValidationError('Booking amount must be greater than zero.');
	}

	const addOns: string[] = Array.isArray(body?.addOns)
		? body.addOns.filter((a: unknown) => typeof a === 'string' && ADD_ONS.includes(a))
		: [];

	const tripType = TRIP_TYPES.includes(body?.tripType) ? body.tripType : '';
	const flexibleDates = body?.flexibleDates === 'yes' || body?.flexibleDates === 'no' ? body.flexibleDates : '';

	return {
		tours,
		tourIds: tours.map((t) => t.id),

		destination: cleanText(body?.destination, 100),
		tripType,
		startDate,
		endDate,
		flexibleDates,
		travelers: cleanCount(body?.travelers),
		addOns,
		customAddOn: addOns.includes('custom') ? cleanText(body?.customAddOn, 500) : '',

		name,
		email,
		phone: cleanText(body?.phone, 40),
		travelingFrom: cleanText(body?.travelingFrom, 120),
		notes: cleanText(body?.notes, 1000),

		amountGBP: totalGBP,
		estimatedTotal: totalGBP,
		convertedAmount,

		countryCode,
		currencyCode: currency.code.toUpperCase()
	};
}