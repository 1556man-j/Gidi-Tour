import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// dLocal sends the customer back here after paying. This only sends them on to the
// thank-you page: coming back does NOT prove they paid. The payment is confirmed
// by dLocal's own server messages (see the webhook next to this file).
function toThankYou(url: URL): never {
	const donationId = url.searchParams.get('donationId');

	if (!donationId) throw redirect(303, '/gidicare');

	throw redirect(303, `/gidicare/thank-you?donationId=${encodeURIComponent(donationId)}`);
}

export const GET: RequestHandler = ({ url }) => toThankYou(url);
export const POST: RequestHandler = ({ url }) => toThankYou(url);
