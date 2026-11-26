import { sanityClient as client, urlFor } from '$lib/sanity/client';
import { sanityWriteClient } from '$lib/sanity/serverClient';

export interface Guide {
	_id: string;
	name: string;
	email: string;
	bio?: string;
	languages?: string[];
	photoUrl?: string;
}

const FIELDS = `_id, name, "email": lower(email), bio, languages, photo`;

const photoOf = (photo: any) => (photo ? urlFor(photo).width(240).height(240).fit('crop').quality(80).url() : undefined);

const toGuide = (g: any): Guide => ({
	_id: g._id,
	name: g.name,
	email: g.email,
	bio: g.bio,
	languages: g.languages,
	photoUrl: photoOf(g.photo)
});

// Guide lookups happen on every chat request, so keep them for a short time.
const cache = new Map<string, { at: number; guide: Guide | null }>();
const TTL = 60_000;

/** The active guide whose sign-in email matches, or null. Decides who gets the guide chat. */
export async function getGuideByEmail(email: string): Promise<Guide | null> {
	const key = email.trim().toLowerCase();
	const hit = cache.get(key);
	if (hit && Date.now() - hit.at < TTL) return hit.guide;

	const row = await client.fetch(
		`*[_type == "guide" && active == true && lower(email) == $email][0]{ ${FIELDS} }`,
		{ email: key }
	);
	const guide = row ? toGuide(row) : null;
	cache.set(key, { at: Date.now(), guide });
	return guide;
}

/** Active guides who lead at least one of these tours (by tour slug), or who can take any tour. */
export async function getGuidesForTours(slugs: string[]): Promise<Guide[]> {
	const rows = await client.fetch(
		`*[_type == "guide" && active == true && (
			coversAllTours == true ||
			count(tours[@->slug.current in $slugs]) > 0
		)]{ ${FIELDS}, "specific": count(tours[@->slug.current in $slugs]) > 0 }`,
		{ slugs }
	);
	const list = (rows as any[]) ?? [];
	// Guides who actually lead the tour come first; backups only if nobody else is listed.
	const specific = list.filter((g) => g.specific);
	return (specific.length ? specific : list).map(toGuide);
}

/* ------------------------------------------------------------- guide accounts */

export type GuideStatus = 'active' | 'pending' | 'rejected' | 'inactive';

export interface GuideTour {
	slug: string;
	title: string;
	country: string;
}

export interface GuideRecord {
	_id: string;
	status: GuideStatus;
	name: string;
	email: string;
	bio: string;
	languages: string[];
	country: string;
	city: string;
	experienceYears: number | null;
	photoUrl?: string;
	tours: GuideTour[];
}

const statusOf = (g: any): GuideStatus =>
	g.active === true ? 'active' : g.applicationStatus === 'rejected' ? 'rejected' : g.applicationStatus === 'pending' ? 'pending' : 'inactive';

/** Any guide record for this email, whatever its status. Read fresh (no CDN) so approvals show up straight away. */
export async function getGuideRecordByEmail(email: string): Promise<GuideRecord | null> {
	const g = await sanityWriteClient.fetch(
		`*[_type == "guide" && lower(email) == $email][0]{
			_id, active, applicationStatus, name, "email": lower(email), bio, languages, country, city, experienceYears, photo,
			"tours": tours[]->{ "slug": slug.current, title, country }
		}`,
		{ email: email.trim().toLowerCase() }
	);
	if (!g) return null;
	return {
		_id: g._id,
		status: statusOf(g),
		name: g.name ?? '',
		email: g.email,
		bio: g.bio ?? '',
		languages: g.languages ?? [],
		country: g.country ?? '',
		city: g.city ?? '',
		experienceYears: typeof g.experienceYears === 'number' ? g.experienceYears : null,
		photoUrl: photoOf(g.photo),
		tours: ((g.tours ?? []) as any[]).filter((t) => t?.slug).map((t) => ({ slug: t.slug, title: t.title, country: t.country }))
	};
}

/** Tours in a country that match these slugs, as Sanity references. Anything not in that country is dropped. */
async function tourRefs(slugs: string[], country: string) {
	if (!slugs.length) return [];
	const rows: { _id: string }[] = await sanityWriteClient.fetch(
		`*[_type == "tour" && slug.current in $slugs && lower(country) == $country]{ _id }`,
		{ slugs, country: country.trim().toLowerCase() }
	);
	return rows.map((r) => ({ _type: 'reference', _key: r._id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 32), _ref: r._id }));
}

export interface GuideApplication {
	country: string;
	city: string;
	languages: string[];
	experienceYears: number;
	bio: string;
	tourSlugs: string[];
}

export async function createGuideApplication(
	customer: { id: string; name: string; email: string; phone?: string },
	app: GuideApplication
) {
	await sanityWriteClient.createIfNotExists({
		_id: `guide-${customer.id}`,
		_type: 'guide',
		name: customer.name,
		email: customer.email.trim().toLowerCase(),
		phone: customer.phone,
		bio: app.bio,
		languages: app.languages,
		country: app.country,
		city: app.city,
		experienceYears: app.experienceYears,
		active: false,
		applicationStatus: 'pending',
		appliedAt: new Date().toISOString(),
		coversAllTours: false,
		tours: await tourRefs(app.tourSlugs, app.country)
	});
}

export async function updateGuideDetails(
	guideId: string,
	patch: { bio?: string; languages?: string[]; city?: string; experienceYears?: number }
) {
	await sanityWriteClient.patch(guideId).set(patch).commit();
}

export async function setGuideTours(guideId: string, country: string, slugs: string[]) {
	await sanityWriteClient.patch(guideId).set({ tours: await tourRefs(slugs, country) }).commit();
}
