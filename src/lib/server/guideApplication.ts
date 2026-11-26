import type { GuideApplication } from '$lib/sanity/queries/guides';

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

export function validateApplication(raw: any): { ok: true; value: GuideApplication } | { ok: false; fieldErrors: Record<string, string> } {
	const fieldErrors: Record<string, string> = {};

	const country = text(raw?.country, 80);
	if (!country) fieldErrors.country = 'Choose the country you are based in.';

	const city = text(raw?.city, 100);
	if (!city) fieldErrors.city = 'Enter the city or town you are based in.';

	const languages = Array.isArray(raw?.languages)
		? [...new Set(raw.languages.map((l: unknown) => text(l, 30)).filter(Boolean))].slice(0, 8)
		: [];
	if (!languages.length) fieldErrors.languages = 'Add at least one language you can guide in.';

	const years = Number(raw?.experienceYears);
	if (!Number.isInteger(years) || years < 0 || years > 60) fieldErrors.experienceYears = 'Enter your years of guiding experience (0 if new).';

	const bio = text(raw?.bio, 600);
	if (bio.length < 20) fieldErrors.bio = 'Tell us a little about yourself (at least 20 characters).';

	if (raw?.acceptedGuideTerms !== true) fieldErrors.acceptedGuideTerms = 'Please accept the guide rules to continue.';

	const tourSlugs = Array.isArray(raw?.tourSlugs) ? [...new Set(raw.tourSlugs.map((s: unknown) => text(s, 120)).filter(Boolean))].slice(0, 60) : [];

	if (Object.keys(fieldErrors).length) return { ok: false, fieldErrors };
	return { ok: true, value: { country, city, languages, experienceYears: years, bio, tourSlugs } as GuideApplication };
}
