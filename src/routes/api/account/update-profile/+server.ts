import { json } from '@sveltejs/kit';
import { sanityWriteClient } from '$lib/sanity/serverClient';
import type { RequestHandler } from './$types';

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) return json({ error: 'Not authenticated.' }, { status: 401 });

	const body = await request.json().catch(() => null);
	if (!body) return json({ error: 'Invalid request.' }, { status: 400 });

	const fieldErrors: Record<string, string> = {};

	const name = str(body.name, 100);
	if (name.length < 2) fieldErrors.name = 'Please enter your full name.';

	const phoneNumber = str(body.phoneNumber, 20);
	if (phoneNumber && !/^[\d\s().-]{6,20}$/.test(phoneNumber)) {
		fieldErrors.phoneNumber = 'Please enter a valid phone number.';
	}

	const dateOfBirth = str(body.dateOfBirth, 10);
	if (dateOfBirth) {
		const valid = /^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) && new Date(dateOfBirth) <= new Date();
		if (!valid) fieldErrors.dateOfBirth = 'Please enter a valid date of birth.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return json({ error: 'Please fix the highlighted fields.', fieldErrors }, { status: 400 });
	}

	await sanityWriteClient
		.patch(session.user.id)
		.set({
			name,
			nationality: str(body.nationality, 80),
			dateOfBirth: dateOfBirth || undefined,
			phoneDialCode: str(body.phoneDialCode, 6),
			phoneNumber,
			address: {
				line1: str(body.address?.line1),
				line2: str(body.address?.line2),
				city: str(body.address?.city, 100),
				region: str(body.address?.region, 100),
				postalCode: str(body.address?.postalCode, 20),
				country: str(body.address?.country, 100)
			},
			emergencyContact: {
				name: str(body.emergencyContact?.name, 100),
				relationship: str(body.emergencyContact?.relationship, 60),
				phone: str(body.emergencyContact?.phone, 25)
			},
			travelNotes: str(body.travelNotes, 1000)
		})
		.commit();

	return json({ success: true });
};