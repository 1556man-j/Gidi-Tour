import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
	throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
}

/**
 * Server-only database client for private data: customers, bookings, store
 * orders and contact messages. It uses the service_role key, which bypasses
 * row-level security, so it must never be imported from browser code and the
 * key must never be in a PUBLIC_ variable.
 */
export const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
	auth: { persistSession: false, autoRefreshToken: false }
});

/** Throws if a Supabase call failed, otherwise returns its data. */
export function unwrap<T>(res: { data: T; error: { message: string; code?: string } | null }): T {
	if (res.error) {
		const err = new Error(res.error.message) as Error & { code?: string };
		err.code = res.error.code;
		throw err;
	}
	return res.data;
}

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

/**
 * Turns a database row (snake_case, nulls) into the same shape the site used
 * when this data lived in Sanity: camelCase keys, `_id`, and no null fields.
 */
export function fromRow(row: Record<string, any> | null) {
	if (!row) return null;

	const out: Record<string, any> = {};

	for (const [key, value] of Object.entries(row)) {
		if (value === null || key === 'id') continue;
		out[camel(key)] = value;
	}

	if ('amountGbp' in out) {
		out.amountGBP = out.amountGbp;
		delete out.amountGbp;
	}

	out._id = row.id;
	return out;
}
