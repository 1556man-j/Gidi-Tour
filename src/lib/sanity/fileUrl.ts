import { sanityClient } from './client';

//  * Sanity file asset refs look like: file-<assetId>-<extension>
//  * e.g. file-abc123def456-pdf
//  *
//  * This builds the permanent, public CDN URL for that file:
//  * https://cdn.sanity.io/files/<projectId>/<dataset>/<assetId>.<extension>
//  *
//  * Note: this URL is public to anyone who has it — there's no auth check.
//  * That matches "permanent access once purchased": the link in the
//  * confirmation email works forever, same as a normal download link.
//  * If you ever want to gate it, you'd need a server route that checks
//  * paymentStatus on an order before redirecting to this URL instead.
 
export function sanityFileUrl(fileRef: string): string {
	const match = fileRef.match(/^file-([a-zA-Z0-9]+)-(\w+)$/);

	if (!match) {
		throw new Error(`Invalid Sanity file reference: ${fileRef}`);
	}

	const [, assetId, extension] = match;
	const { projectId, dataset } = sanityClient.config();

	return `https://cdn.sanity.io/files/${projectId}/${dataset}/${assetId}.${extension}`;
}