import { error } from '@sveltejs/kit';
import { getOrderStatus } from '$lib/sanity/queries/storeOrder';
import { getMagazineStoragePaths, verifyDownloadToken } from '$lib/server/magazineDownload';
import { db } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, url, locals }) => {
	const { orderId, slug } = params;

	const order = await getOrderStatus(orderId);

	// Same answer for "no such order", "not paid" and "not yours", so nobody
	// can use this route to find out which orders exist.
	if (!order || order.paymentStatus !== 'paid') throw error(404, 'Download not found.');

	// Allowed if the link carries a valid signed token (emailed links),
	// or if the logged-in customer owns the order.
	let allowed = verifyDownloadToken(orderId, slug, url.searchParams.get('t') ?? '');

	if (!allowed) {
		const session = await locals.auth();
		allowed = !!session?.user?.id && order.customerId === session.user.id;
	}

	if (!allowed) throw error(404, 'Download not found.');

	const inOrder = (order.items ?? []).some(
		(item: { id: string; category: string }) => item.id === slug && item.category === 'magazine'
	);

	if (!inOrder) throw error(404, 'Download not found.');

	const path = (await getMagazineStoragePaths([slug])).get(slug);

	if (!path) throw error(404, 'This file is not available yet. Please contact support.');

	const { data, error: signError } = await db.storage
		.from('magazines')
		.createSignedUrl(path, 60, { download: path.split('/').pop() ?? 'magazine.pdf' });

	if (signError || !data?.signedUrl) {
		console.error('Could not sign magazine download:', signError?.message);
		throw error(500, 'Could not prepare your download. Please try again.');
	}

	return new Response(null, {
		status: 302,
		headers: { Location: data.signedUrl, 'Cache-Control': 'no-store' }
	});
};
