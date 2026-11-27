import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

// Read at request time (not build time), so changing a host env var and redeploying always takes effect.
// Surrounding spaces, newlines and quote marks are stripped: a pasted key with a trailing newline is the
// most common cause of dLocal error 3001 "Invalid credentials".
const clean = (v: string | undefined) => (v ?? '').trim().replace(/^["']|["']$/g, '').trim();

// Defaults to the sandbox so a missing setting can never hit live payments.
// For live, set DLOCAL_API_BASE=https://api.dlocal.com in your host's env vars.
const DLOCAL_API_BASE = (clean(env.DLOCAL_API_BASE) || 'https://sandbox.dlocal.com').replace(/\/+$/, '');
if (!clean(env.DLOCAL_API_BASE)) console.warn('DLOCAL_API_BASE is not set, so dLocal is using the SANDBOX. Set it to https://api.dlocal.com for live payments.');

export function dlocalHeaders(bodyString: string) {
	const login = clean(env.DLOCAL_X_LOGIN);
	const transKey = clean(env.DLOCAL_X_TRANS_KEY);
	const secret = clean(env.DLOCAL_SECRET_KEY);
	const date = new Date().toISOString();
	const signature = crypto.createHmac('sha256', secret).update(`${login}${date}${bodyString}`).digest('hex');

	return {
		'Content-Type': 'application/json',
		'X-Date': date,
		'X-Login': login,
		'X-Trans-Key': transKey,
		'X-Version': '2.1',
		Authorization: `V2-HMAC-SHA256, Signature: ${signature}`
	};
}

/** Safe-to-share facts about the dLocal setup (never the keys themselves). */
export function dlocalSetupSummary() {
	const base = DLOCAL_API_BASE;
	return {
		apiBase: base,
		mode: base.includes('sandbox') ? 'SANDBOX' : 'LIVE',
		loginLength: clean(env.DLOCAL_X_LOGIN).length,
		transKeyLength: clean(env.DLOCAL_X_TRANS_KEY).length,
		secretKeyLength: clean(env.DLOCAL_SECRET_KEY).length,
		hadStrayWhitespaceOrQuotes: [env.DLOCAL_API_BASE, env.DLOCAL_X_LOGIN, env.DLOCAL_X_TRANS_KEY, env.DLOCAL_SECRET_KEY].some(
			(v) => v !== undefined && v !== clean(v)
		)
	};
}

const HINTS: Record<string, string> = {
	'3001':
		'Invalid credentials. Check that (1) the three keys are from the same dLocal environment as DLOCAL_API_BASE (sandbox keys only work on https://sandbox.dlocal.com, live keys only on https://api.dlocal.com), (2) X-Login, X-Trans-Key and Secret Key are not swapped, and (3) dLocal has enabled your account for this API.'
};

/** Logs a dLocal failure with the error code and a plain hint, so the host logs say what to fix. */
export function logDlocalFailure(context: string, data: any) {
	const code = String(data?.code ?? '');
	const s = dlocalSetupSummary();
	console.error(
		`${context}: dLocal code=${code || '?'} message=${data?.message ?? ''} mode=${s.mode} base=${s.apiBase}` +
			(HINTS[code] ? ` | HINT: ${HINTS[code]}` : ''),
		data
	);
}

export { DLOCAL_API_BASE };
