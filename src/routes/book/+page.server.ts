import { getPageSeo } from '$lib/sanity/queries/pageSeo';
import { getFaqsForPage } from '$lib/sanity/queries/faq';
import { getAllTours } from '$lib/sanity/queries/tours'; // use the same import as your tours page
import { getPaymentProvider } from '$lib/server/paymentRouter';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getCustomerProfile } from '$lib/sanity/queries/customer';


export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth();
	const profile = session?.user?.id ? await getCustomerProfile(session.user.id) : null;


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

	const prefill = {
	name: profile?.name ?? session?.user?.name ?? '',
	email: profile?.email ?? session?.user?.email ?? '',
	phone: [profile?.phoneDialCode, profile?.phoneNumber].filter(Boolean).join(' '),
	travelingFrom: profile?.address?.country ?? profile?.nationality ?? ''
};


	return { pageSeo, sanityFaqs, sanityTours, paymentProvider, session, prefill  };
};
