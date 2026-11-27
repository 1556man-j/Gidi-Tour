import { db } from '$lib/server/supabase';
import { sanityWriteClient } from '$lib/sanity/serverClient';

/** A paid booking that has not finished yet. We ask the person to talk to us before deleting, so nobody loses a trip by accident. */
export async function hasUpcomingPaidTrip(customerId: string): Promise<boolean> {
	const today = new Date().toISOString().slice(0, 10);
	const { data } = await db
		.from('bookings')
		.select('start_date, end_date')
		.eq('customer_id', customerId)
		.eq('payment_status', 'paid');
	return (data ?? []).some((b: { start_date: string | null; end_date: string | null }) => {
		const last = b.end_date || b.start_date;
		return !!last && last >= today;
	});
}

/**
 * Removes a person's personal data.
 * - Chats are deleted.
 * - Bookings and store orders are kept for accounting, but the name, contact details, notes and address are wiped.
 * - The account row is deleted (or, if the database refuses, emptied so nobody can sign in to it).
 * - A guide profile in Sanity is deleted.
 */
export async function deleteAccountData(customerId: string, email: string) {
	const mail = email.trim().toLowerCase();

	// Guide profile (created by the app, or added by hand with this email).
	try {
		const ids: string[] = await sanityWriteClient.fetch(`*[_type == "guide" && (_id == $id || lower(email) == $email)]._id`, {
			id: `guide-${customerId}`,
			email: mail
		});
		for (const id of ids) await sanityWriteClient.delete(id);
	} catch (error) {
		console.error('Could not remove the guide profile:', error);
	}

	// Chats: the person's own conversations go (messages and reports go with them).
	await db.from('conversations').delete().eq('customer_id', customerId);
	// Chats where they were the guide stay for the traveller, but lose the guide's details.
	await db.from('conversations').update({ guide_email: null, guide_name: null, guide_photo_url: null, guide_sanity_id: null }).eq('guide_email', mail);

	// Keep the money records, drop the person.
	await db
		.from('bookings')
		.update({ customer_id: null, name: 'Deleted customer', email: 'deleted@giditour.invalid', phone: null, traveling_from: null, notes: null, custom_add_on: null })
		.eq('customer_id', customerId);
	await db
		.from('store_orders')
		.update({ customer_id: null, name: 'Deleted customer', email: 'deleted@giditour.invalid', shipping: null })
		.eq('customer_id', customerId);

	const del = await db.from('customers').delete().eq('id', customerId);
	if (del.error) {
		const wipe = await db
			.from('customers')
			.update({
				name: 'Deleted user',
				email: `deleted+${customerId}@giditour.invalid`,
				password_hash: null,
				provider: 'deleted',
				email_verified: false,
				nationality: null,
				date_of_birth: null,
				phone_dial_code: null,
				phone_number: null,
				address: null,
				emergency_contact: null,
				travel_notes: null,
				avatar_url: null
			})
			.eq('id', customerId);
		if (wipe.error) throw new Error(wipe.error.message);
	}
}
