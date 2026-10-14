import crypto from 'node:crypto';
import { AUTH_SECRET } from '$env/static/private';
import { sanityWriteClient } from '$lib/sanity/serverClient';

// Magazine files live in a PRIVATE Supabase Storage bucket called "magazines".
// Nobody can open them directly. Every download goes through
// /api/store/download/[orderId]/[slug], which checks the order is paid and
// then redirects to a signed link that expires after about a minute.
//
// Links in confirmation emails carry a signed token (made with AUTH_SECRET) so
// guest buyers can download without logging in. The token only works for that
// one order and that one magazine.

function sign(orderId: string, slug: string): string {
	return crypto.createHmac('sha256', AUTH_SECRET).update(`magazine:${orderId}:${slug}`).digest('hex');
}

export function verifyDownloadToken(orderId: string, slug: string, token: string): boolean {
	const expected = Buffer.from(sign(orderId, slug));
	const given = Buffer.from(token);

	return given.length === expected.length && crypto.timingSafeEqual(given, expected);
}

export function downloadUrl(origin: string, orderId: string, slug: string): string {
	return `${origin}/api/store/download/${encodeURIComponent(orderId)}/${encodeURIComponent(slug)}?t=${sign(orderId, slug)}`;
}

// Reads straight from Sanity (no CDN) so a file name you just saved works at once.
// storagePath is only a file name in the private bucket. It is useless without
// the bucket, so it is safe for it to sit in Sanity.
export async function getMagazineStoragePaths(slugs: string[]): Promise<Map<string, string>> {
	if (slugs.length === 0) return new Map();

	const rows = await sanityWriteClient.fetch<{ slug: string; storagePath?: string }[]>(
		`*[_type == "storeProduct" && category == "magazine" && slug.current in $slugs]{
			"slug": slug.current,
			storagePath
		}`,
		{ slugs }
	);

	return new Map(rows.filter((r) => r.storagePath).map((r) => [r.slug, r.storagePath as string]));
}

/** Download links for every magazine in an order that has a file in storage. */
export async function buildDownloadLinks(
	origin: string,
	order: { _id: string; items?: { id: string; category: string; title: string }[] }
): Promise<{ title: string; url: string }[]> {
	const magazines = (order.items ?? []).filter((item) => item.category === 'magazine');
	const paths = await getMagazineStoragePaths(magazines.map((m) => m.id));

	return magazines
		.filter((m) => paths.has(m.id))
		.map((m) => ({ title: m.title, url: downloadUrl(origin, order._id, m.id) }));
}
