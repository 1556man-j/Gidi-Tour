import { error, redirect } from '@sveltejs/kit';
import { getBookingByIdForCustomer } from '$lib/sanity/queries/booking';
import { getStoreOrderByIdForCustomer } from '$lib/sanity/queries/storeOrder';
import { buildDownloadLinks } from '$lib/server/magazineDownload';
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

	const downloadLinks = await buildDownloadLinks(event.url.origin, storeOrder);

	return { booking: null, storeOrder, downloadLinks };
};