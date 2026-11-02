import { error } from '@sveltejs/kit';
import { getGidiCareCaseBySlug, getGidiCareSettings } from '$lib/sanity/queries/gidicare';
import {
	getGidiCareTotals,
	DONATION_PRESETS,
	MIN_DONATION_GBP,
	MAX_DONATION_GBP
} from '$lib/server/donations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const item = await getGidiCareCaseBySlug(params.slug);

	if (!item) {
		throw error(404, 'Animal not found.');
	}

	const [settings, totals] = await Promise.all([
		getGidiCareSettings(),
		getGidiCareTotals().catch(() => null)
	]);

	return {
		item,
		raisedGBP: (totals?.byCase.get(item.slug.current)?.total ?? 0) + (item.raisedOffsetGBP ?? 0),
		supporters: totals?.byCase.get(item.slug.current)?.supporters ?? 0,
		legalNotice: settings?.legalNotice,
		presets: DONATION_PRESETS,
		minGBP: MIN_DONATION_GBP,
		maxGBP: MAX_DONATION_GBP
	};
};
