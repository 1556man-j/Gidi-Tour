// One-time cleanup: removes the old public "digitalFile" PDFs from Sanity.
//
// 1. DOWNLOAD your magazine PDFs first and upload them to the private
//    "magazines" bucket in Supabase. This script deletes them from Sanity.
// 2. Run without --confirm to see what it would do:
//      node --env-file=.env scripts/remove-digital-files.mjs
// 3. Run for real:
//      node --env-file=.env scripts/remove-digital-files.mjs --confirm

import { createClient } from '@sanity/client';

const client = createClient({
	projectId: process.env.PUBLIC_SANITY_PROJECT_ID,
	dataset: process.env.PUBLIC_SANITY_DATASET,
	apiVersion: '2024-01-01',
	token: process.env.SANITY_WRITE_TOKEN,
	useCdn: false
});

const confirm = process.argv.includes('--confirm');

const products = await client.fetch(
	`*[_type == "storeProduct" && defined(digitalFile)]{ _id, title, "assetId": digitalFile.asset._ref }`
);

if (products.length === 0) {
	console.log('No products have a digitalFile. Nothing to do.');
	process.exit(0);
}

for (const p of products) {
	console.log(`${confirm ? 'Removing' : 'Would remove'}: ${p.title} (${p._id}) -> ${p.assetId}`);
}

if (!confirm) {
	console.log('\nDry run only. Add --confirm to delete these files from Sanity.');
	process.exit(0);
}

for (const p of products) {
	await client.patch(p._id).unset(['digitalFile']).commit();

	if (p.assetId) {
		try {
			await client.delete(p.assetId);
		} catch (error) {
			console.error(`Could not delete asset ${p.assetId}:`, error.message);
		}
	}
}

console.log('\nDone. The files can no longer be downloaded from Sanity.');
