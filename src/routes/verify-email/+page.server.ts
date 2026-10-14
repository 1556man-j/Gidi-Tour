import { fail } from '@sveltejs/kit';
import { isVerifyTokenValid, verifyEmailByToken } from '$lib/sanity/queries/customer';
import { hashToken } from '$lib/server/verifyEmail';
import type { Actions, PageServerLoad } from './$types';

// Opening the link only CHECKS the token. The email is confirmed when the person
// presses the button. That way email security scanners that "click" links in
// advance can't use the link up before the customer does.
export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token') ?? '';
	const valid = token.length > 0 && (await isVerifyTokenValid(hashToken(token)));

	return { token, valid };
};

export const actions: Actions = {
	confirm: async ({ request }) => {
		const form = await request.formData();
		const token = String(form.get('token') ?? '');

		const ok = token ? await verifyEmailByToken(hashToken(token)) : false;

		if (!ok) return fail(400, { verified: false });

		return { verified: true };
	}
};
