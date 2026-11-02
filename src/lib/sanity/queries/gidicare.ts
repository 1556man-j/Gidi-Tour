import { sanityClient } from '../client';

type SanityImage = { asset: { _ref: string }; alt?: string };

export interface GidiCareSettings {
	heroTitle?: string;
	heroSubtitle?: string;
	heroImage?: SanityImage;
	intro?: string;
	fundsUse?: { _key: string; label: string; description?: string }[];
	faqs?: { _key: string; question: string; answer: string }[];
	legalNotice?: string;
}

export interface GidiCareCase {
	_id: string;
	title: string;
	slug: { current: string };
	status: 'active' | 'funded' | 'recovered';
	animalType?: 'dog' | 'cat' | 'other';
	location?: string;
	partnerName?: string;
	photo?: SanityImage;
	summary?: string;
	goalGBP?: number;
	raisedOffsetGBP?: number;
	story?: unknown[];
	gallery?: (SanityImage & { _key?: string })[];
	updates?: { _key: string; date?: string; text?: string; image?: SanityImage }[];
}

export async function getGidiCareSettings(): Promise<GidiCareSettings | null> {
	return sanityClient.fetch(`*[_type == "gidicareSettings"][0]`);
}

// Active animals first, then fully funded, then recovered.
export async function getGidiCareCases(): Promise<GidiCareCase[]> {
	return sanityClient.fetch(
		`*[_type == "gidicareCase"] | order(select(status == "active" => 0, status == "funded" => 1, 2) asc, _createdAt desc){
			_id, title, slug, status, animalType, location, photo, summary, goalGBP, raisedOffsetGBP
		}`
	);
}

export async function getGidiCareCaseBySlug(slug: string): Promise<GidiCareCase | null> {
	return sanityClient.fetch(`*[_type == "gidicareCase" && slug.current == $slug][0]`, { slug });
}

/** Fresh read (no CDN cache), used to check a case really accepts donations. */
export async function getGidiCareCaseStatus(
	slug: string
): Promise<{ title: string; status: string } | null> {
	return sanityClient.withConfig({ useCdn: false }).fetch(
		`*[_type == "gidicareCase" && slug.current == $slug][0]{ title, status }`,
		{ slug }
	);
}

export async function getGidiCareCaseTitle(slug: string): Promise<string | undefined> {
	const found = await sanityClient.fetch<{ title?: string } | null>(
		`*[_type == "gidicareCase" && slug.current == $slug][0]{ title }`,
		{ slug }
	);

	return found?.title;
}
