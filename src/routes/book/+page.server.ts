import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import { getAllTours } from '$lib/sanity/queries/tours'; // use the same import as your tours page
import { getPaymentProvider } from '$lib/server/paymentRouter';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';


export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user) {
		throw redirect(303, '/login?redirectTo=/book');
	}

	const parentData = await event.parent();

	const [pageSeo, sanityFaqs, sanityTours] = await Promise.all([
		getPageSeo('book'),
		getFaqsForPage('book'),
		getAllTours()
	]);

	const paymentProvider = getPaymentProvider(parentData.countryCode);

	return { pageSeo, sanityFaqs, sanityTours, paymentProvider, session };
};
