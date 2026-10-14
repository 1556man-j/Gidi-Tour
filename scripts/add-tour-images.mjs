import { createClient } from '@sanity/client';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs/promises';

const {
	PUBLIC_SANITY_PROJECT_ID,
	PUBLIC_SANITY_DATASET,
	SANITY_WRITE_TOKEN,
	PIXABAY_API_KEY
} = process.env;

if (!PUBLIC_SANITY_PROJECT_ID || !PUBLIC_SANITY_DATASET || !SANITY_WRITE_TOKEN || !PIXABAY_API_KEY) {
	console.error('Missing env vars. Check .env');
	process.exit(1);
}

// ---- CLI flags: --dry  --limit=20  --gallery=3 ----
const args = process.argv.slice(2);
const DRY = args.includes('--dry');
const LIMIT = Number(args.find((a) => a.startsWith('--limit='))?.split('=')[1]) || Infinity;
const GALLERY = Number(args.find((a) => a.startsWith('--gallery='))?.split('=')[1] ?? 3);

const STATE_FILE = '.tour-images-state.json';

const sanity = createClient({
	projectId: PUBLIC_SANITY_PROJECT_ID,
	dataset: PUBLIC_SANITY_DATASET,
	apiVersion: '2024-01-01',
	useCdn: false,
	token: SANITY_WRITE_TOKEN
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- progress state (re-running never reuses a photo or repeats work) ----
async function loadState() {
	try {
		return JSON.parse(await fs.readFile(STATE_FILE, 'utf8'));
	} catch {
		return { usedPhotoIds: [], report: [] };
	}
}
const state = await loadState();
const used = new Set(state.usedPhotoIds);
const saveState = () =>
	fs.writeFile(STATE_FILE, JSON.stringify({ usedPhotoIds: [...used], report: state.report }, null, 2));

// ---- Pixabay search (waits automatically when the rate limit is hit) ----
async function pixabaySearch(query) {
	const url = new URL('https://pixabay.com/api/');
	url.searchParams.set('key', PIXABAY_API_KEY);
	url.searchParams.set('q', query.slice(0, 100));
	url.searchParams.set('image_type', 'photo');
	url.searchParams.set('orientation', 'horizontal');
	url.searchParams.set('min_width', '1600');
	url.searchParams.set('safesearch', 'true');
	url.searchParams.set('order', 'popular');
	url.searchParams.set('per_page', '50');

	for (;;) {
		const res = await fetch(url);
		const resetSec = Number(res.headers.get('x-ratelimit-reset')); // seconds until reset
		const waitMs = ((resetSec || 60) + 1) * 1000;

		if (res.status === 429) {
			console.log(`  rate limit reached, waiting ${Math.round(waitMs / 1000)}s...`);
			await sleep(waitMs);
			continue;
		}
		if (!res.ok) throw new Error(`Pixabay ${res.status}: ${await res.text()}`);

		const remaining = Number(res.headers.get('x-ratelimit-remaining'));
		if (!Number.isNaN(remaining) && remaining <= 1) await sleep(waitMs);

		return (await res.json()).hits ?? [];
	}
}

// ---- choose the best unused photos from results ----
function pickPhotos(hits, keywords, n) {
	return hits
		.filter((p) => !used.has(p.id) && p.imageWidth > p.imageHeight)
		.map((p) => {
			const tags = (p.tags ?? '').toLowerCase();
			const score = keywords.filter((k) => tags.includes(k)).length;
			return { p, score };
		})
		.sort((a, b) => b.score - a.score)
		.slice(0, n)
		.map((x) => x.p);
}

const words = (s) =>
	(s ?? '')
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((w) => w.length > 3);

// Try specific -> generic until we get at least one usable photo
async function findPhotos(tour, need) {
	const keywords = [...new Set([...words(tour.title), ...words(tour.country)])];
	const attempts = [
		{ level: 'title+country', q: `${tour.title} ${tour.country}` },
		{ level: 'title', q: tour.title },
		{ level: 'country+category', q: `${tour.country} ${tour.category ?? ''}`.trim() },
		{ level: 'country', q: `${tour.country} travel` }
	];

	for (const a of attempts) {
		const photos = pickPhotos(await pixabaySearch(a.q), keywords, need);
		if (photos.length) return { photos, ...a };
	}
	return null;
}

async function uploadPhoto(photo) {
	const res = await fetch(photo.largeImageURL);
	if (!res.ok) throw new Error(`download failed ${res.status}`);
	const buffer = Buffer.from(await res.arrayBuffer());
	return sanity.assets.upload('image', buffer, {
		filename: `pixabay-${photo.id}.jpg`,
		contentType: 'image/jpeg'
	});
}

const imageRef = (asset) => ({ _type: 'image', asset: { _type: 'reference', _ref: asset._id } });

// ---- main ----
const tours = await sanity.fetch(
	`*[_type == "tour" && !(_id in path("drafts.**")) && !defined(image.asset)]
	 | order(title asc){ _id, title, country, category, "slug": slug.current, "galleryCount": count(gallery) }`
);

console.log(`${tours.length} tours without a cover image${DRY ? ' (dry run)' : ''}`);

let done = 0;
for (const tour of tours) {
	if (done >= LIMIT) break;
	console.log(`[${done + 1}] ${tour.title} (${tour.country})`);

	try {
		const needGallery = tour.galleryCount === 0 ? GALLERY : 0;
		const found = await findPhotos(tour, 1 + needGallery);

		if (!found) {
			console.log('  no photos found, skipping');
			state.report.push({ slug: tour.slug, title: tour.title, level: 'NONE' });
			await saveState();
			continue;
		}

		const [cover, ...extra] = found.photos;
		console.log(`  ${found.level}: "${found.q}" -> photo ${cover.id} (+${extra.length} gallery)`);

		if (!DRY) {
			const coverAsset = await uploadPhoto(cover);
			const galleryAssets = [];
			for (const p of extra) galleryAssets.push(await uploadPhoto(p));

			await sanity
				.patch(tour._id)
				.set({
					image: imageRef(coverAsset),
					imageCredit: `Image by ${cover.user} on Pixabay (${cover.pageURL})`,
					...(galleryAssets.length && {
						gallery: galleryAssets.map((a) => ({ _key: randomUUID().slice(0, 12), ...imageRef(a) }))
					})
				})
				.commit();

			for (const p of found.photos) used.add(p.id);
		}

		state.report.push({
			slug: tour.slug,
			title: tour.title,
			level: found.level,
			query: found.q,
			photoId: cover.id
		});
		await saveState();
		done++;
	} catch (err) {
		console.error(`  FAILED: ${err.message}`);
	}
}

console.log(`Done. ${done} tours updated. Review ${STATE_FILE} for tours that fell back to generic photos.`);