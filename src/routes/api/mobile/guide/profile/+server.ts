import { json } from '@sveltejs/kit';
import { getGuideRecordByEmail, updateGuideDetails } from '$lib/sanity/queries/guides';
import type { RequestHandler } from './$types';

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session?.user?.id || !session.user.email) return json({ error: 'Not authenticated.' }, { status: 401 });

	const guide = await getGuideRecordByEmail(session.user.email);
	if (!guide || (guide.status !== 'active' && guide.status !== 'pending')) return json({ error: 'Guide profile not found.' }, { status: 404 });

	const body = await request.json().catch(() => null);
	const fieldErrors: Record<string, string> = {};
	const patch: { bio?: string; languages?: string[]; city?: string; experienceYears?: number } = {};

	if (body?.bio !== undefined) {
		const bio = text(body.bio, 600);
		if (bio.length < 20) fieldErrors.bio = 'Tell us a little about yourself (at least 20 characters).';
		else patch.bio = bio;
	}
	if (body?.city !== undefined) {
		const city = text(body.city, 100);
		if (!city) fieldErrors.city = 'Enter your city or town.';
		else patch.city = city;
	}
	if (body?.languages !== undefined) {
		const languages = Array.isArray(body.languages) ? [...new Set(body.languages.map((l: unknown) => text(l, 30)).filter(Boolean))].slice(0, 8) : [];
		if (!languages.length) fieldErrors.languages = 'Add at least one language.';
		else patch.languages = languages as string[];
	}
	if (body?.experienceYears !== undefined) {
		const y = Number(body.experienceYears);
		if (!Number.isInteger(y) || y < 0 || y > 60) fieldErrors.experienceYears = 'Enter a number from 0 to 60.';
		else patch.experienceYears = y;
	}

	if (Object.keys(fieldErrors).length) return json({ error: 'Please fix the highlighted fields.', fieldErrors }, { status: 400 });
	if (Object.keys(patch).length) await updateGuideDetails(guide._id, patch);
	return json({ success: true });
};
