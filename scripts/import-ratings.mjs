// Imports REAL ratings from a CSV file into your tours.
//
// Only use this with ratings that genuinely came from customers (for example your
// own records, or exported from a review platform you have permission to use).
// Do not invent numbers: showing made-up ratings to customers is misleading and
// is against consumer-protection law in many countries.
//
// CSV format (first line is the header):
//   slug,rating,reviewCount
//   lagos-city-tour,4.8,23
//
// Preview:   node --env-file=.env scripts/import-ratings.mjs ratings.csv
// For real:  node --env-file=.env scripts/import-ratings.mjs ratings.csv --confirm

import fs from 'node:fs';
import { createClient } from '@sanity/client';

const file = process.argv[2];
const confirm = process.argv.includes('--confirm');

if (!file) {
	console.error('Usage: node --env-file=.env scripts/import-ratings.mjs ratings.csv [--confirm]');
	process.exit(1);
}

const client = createClient({
	projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: process.env.PUBLIC_SANITY_DATASET,
	apiVersion: '2024-01-01',
	token: process.env.SANITY_WRITE_TOKEN,
	useCdn: false
});

const rows = fs
	.readFileSync(file, 'utf8')
	.split(/\r?\n/)
	.slice(1)
	.filter((line) => line.trim())
	.map((line) => {
		const [slug, rating, reviewCount] = line.split(',').map((v) => v.trim());
		return { slug, rating: Number(rating), reviewCount: Number(reviewCount) };
	});

let ok = 0;
let skipped = 0;

for (const row of rows) {
	const valid =
		row.slug &&
		Number.isFinite(row.rating) &&
		row.rating >= 1 &&
		row.rating <= 5 &&
		Number.isInteger(row.reviewCount) &&
		row.reviewCount > 0;

	if (!valid) {
		console.log(`Skipped (rating must be 1 to 5 and reviewCount above 0): ${JSON.stringify(row)}`);
		skipped++;
		continue;
	}

	const id = await client.fetch(`*[_type == "tour" && slug.current == $slug][0]._id`, {
		slug: row.slug
	});

	if (!id) {
		console.log(`Skipped (no tour with this slug): ${row.slug}`);
		skipped++;
		continue;
	}

	console.log(`${confirm ? 'Setting' : 'Would set'} ${row.slug}: ${row.rating} (${row.reviewCount} reviews)`);

	if (confirm) {
		await client.patch(id).set({ rating: row.rating, reviewCount: row.reviewCount }).commit();
	}

	ok++;
}

console.log(`\n${ok} ${confirm ? 'updated' : 'would be updated'}, ${skipped} skipped.`);
if (!confirm) console.log('This was a preview only. Add --confirm to save.');
