import { getGidiCareCases, getGidiCareSettings } from '$lib/sanity/queries/gidicare';
import {
	getGidiCareTotals,
	getRecentSupporters,
	DONATION_PRESETS,
	MIN_DONATION_GBP,
	MAX_DONATION_GBP
} from '$lib/server/donations';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [settings, cases, totals, supporters] = await Promise.all([
		getGidiCareSettings(),
		getGidiCareCases(),
		getGidiCareTotals().catch(() => null), // the page still works if the database is unreachable
		getRecentSupporters().catch(() => [] as string[])
	]);

	const items = cases.map((item) => ({
		...item,
		raisedGBP: (totals?.byCase.get(item.slug.current)?.total ?? 0) + (item.raisedOffsetGBP ?? 0)
	}));

	// Only real numbers are ever shown: the page hides any figure that is zero.
	const stats = {
		raisedGBP:
			(totals?.all.total ?? 0) + cases.reduce((sum, c) => sum + (c.raisedOffsetGBP ?? 0), 0),
		supporters: totals?.all.supporters ?? 0,
		helped: cases.filter((c) => c.status !== 'active').length
	};

	return {
		settings,
		active: items.filter((i) => i.status === 'active'),
		helped: items.filter((i) => i.status !== 'active'),
		stats,
		supporters,
		presets: DONATION_PRESETS,
		minGBP: MIN_DONATION_GBP,
		maxGBP: MAX_DONATION_GBP
	};
};
