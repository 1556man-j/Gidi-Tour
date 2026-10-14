import { json } from '@sveltejs/kit';
import { db } from '$lib/server/supabase';

/**
 * Counts one attempt for `key` and says whether the caller is over the limit.
 * The counter lives in Supabase (see the rate_limit_hit SQL function), so it
 * works across serverless instances and survives cold starts.
 *
 * If the limiter itself fails, requests are allowed through: a database blip
 * should never stop real customers from paying or logging in.
 */
export async function isRateLimited(
	key: string,
	limit: number,
	windowSeconds: number
): Promise<boolean> {
	try {
		const { data, error } = await db.rpc('rate_limit_hit', {
			p_key: key,
			p_window_seconds: windowSeconds,
			p_max: limit
		});

		if (error) {
			console.error('Rate limiter error:', error.message);
			return false;
		}

		return data === false;
	} catch (error) {
		console.error('Rate limiter failed:', error);
		return false;
	}
}

/** The visitor's IP from SvelteKit's getClientAddress, or "unknown". */
export function ipOf(getClientAddress: () => string): string {
	try {
		return getClientAddress();
	} catch {
		return 'unknown';
	}
}

/** The visitor's IP from raw request headers (used inside Auth.js). */
export function ipFromRequest(request: Request): string {
	return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export const tooManyRequests = () =>
	json({ error: 'Too many attempts. Please wait a while and try again.' }, { status: 429 });
