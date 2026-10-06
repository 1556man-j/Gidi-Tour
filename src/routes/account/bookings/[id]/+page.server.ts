import { error, redirect } from '@sveltejs/kit';
import { getBookingByIdForCustomer } from '$lib/sanity/queries/booking';
import {
	getStoreOrderByIdForCustomer,
	getMagazineDownloadFiles
} from '$lib/sanity/queries/storeOrder';
import { sanityFileUrl } from '$lib/sanity/fileUrl';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user?.id) {
		throw redirect(303, `/login?redirectTo=/account/bookings/${event.params.id}`);
	}

	const { id } = event.params;

	// 1. Tour booking?
	const booking = await getBookingByIdForCustomer(id, session.user.id);
	if (booking) {
		return { booking, storeOrder: null, downloadLinks: [] as { title: string; url: string }[] };
	}

	// 2. Store order?
	const storeOrder = await getStoreOrderByIdForCustomer(id, session.user.id, session.user.email);
	if (!storeOrder) {
		throw error(404, 'Booking not found');
	}

	const magazineSlugs = (storeOrder.items ?? [])
		.filter((item: { category: string }) => item.category === 'magazine')
		.map((item: { id: string }) => item.id);

	const magazineFiles = await getMagazineDownloadFiles(magazineSlugs);

	const downloadLinks = magazineFiles
		.filter((p: { digitalFile?: { asset?: { _ref: string } } }) => p.digitalFile?.asset?._ref)
		.map((p: { title: string; digitalFile: { asset: { _ref: string } } }) => ({
			title: p.title,
			url: sanityFileUrl(p.digitalFile.asset._ref)
		}));

	return { booking: null, storeOrder, downloadLinks };
};