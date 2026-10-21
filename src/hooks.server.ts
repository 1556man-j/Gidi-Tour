import { handle as authHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { sessionCookieName } from '$lib/server/mobileSession';
import { detectCountryFromIp } from '$lib/server/geoCurrency';

// These are called by dLocal / Stripe from outside our site, so they cannot
// pass an origin check. Payment confirmation must still use server-side
// provider verification (see paymentSettlement.ts).
const CSRF_EXEMPT_PATHS = new Set([
	'/api/book/dlocal/return',
	'/api/book/dlocal/webhook',
	'/api/book/stripe/webhook',
	'/api/store/checkout/dlocal/return',
	'/api/store/checkout/dlocal/webhook'
]);

// "/API/Book/dlocal/return/" and "/api/book/dlocal/return" are the same route.
function normalizePath(pathname: string) {
	return pathname.toLowerCase().replace(/\/+$/, '') || '/';
}

/**
 * Mobile bridge:
 * 1. For mobile requests with a Bearer token, expose the token as the
 *    session cookie expected by the existing authentication flow.
 * 2. Detect the visitor's country server-side, as on the website.
 */
const mobileBridge: Handle = async ({ event, resolve }) => {
	if (event.request.headers.get('x-gidi-client') === 'mobile') {
		const auth = event.request.headers.get('authorization');
		if (auth?.startsWith('Bearer ')) {
			const headers = new Headers(event.request.headers);
			const existing = headers.get('cookie');
			headers.set('cookie', `${existing ? existing + '; ' : ''}${sessionCookieName(event.url)}=${auth.slice(7)}`);
			event.request = new Request(event.request, { headers });
		}
		if (!/^[A-Z]{2}$/.test(event.cookies.get('visitor_country') ?? '')) {
			const country = (await detectCountryFromIp(event.getClientAddress())) ?? 'GB';
			event.cookies.set('visitor_country', country, { path: '/', maxAge: 60 * 60 * 24 * 30 });
		}
	}
	return resolve(event);
};

const devCors: Handle = async ({ event, resolve }) => {
	const origin = event.request.headers.get('origin') ?? '';
	const allowed = dev && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
	if (!allowed) return resolve(event);
	const cors = {
		'Access-Control-Allow-Origin': origin,
		'Access-Control-Allow-Headers': 'authorization, content-type, x-gidi-client',
		'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
		Vary: 'Origin'
	};
	if (event.request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
	const response = await resolve(event);
	try {
		for (const [k, v] of Object.entries(cors)) response.headers.set(k, v);
	} catch {
		// Some responses have locked headers.
	}
	return response;
};


const csrfHandle: Handle = async ({ event, resolve }) => {
	const path = normalizePath(event.url.pathname);
	const isExempt = CSRF_EXEMPT_PATHS.has(path);

	// Diagnostic: shows in your host's runtime logs every time a payment provider
	// calls us. If the customer sees "Cross-site POST form submissions are forbidden"
	// and this line is MISSING from the logs, the request was stopped by SvelteKit's
	// built-in check before it reached this file.
	if (isExempt && event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		console.log(
			`Payment callback reached the app: ${event.request.method} ${event.url.pathname} ` +
				`(origin: ${event.request.headers.get('origin') ?? 'none'}, ` +
				`content-type: ${event.request.headers.get('content-type') ?? 'none'})`
		);
	}

	if (!isExempt && event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		const origin = event.request.headers.get('origin');
		const contentType = event.request.headers.get('content-type') ?? '';

		const looksLikeForm =
			contentType.includes('application/x-www-form-urlencoded') ||
			contentType.includes('multipart/form-data') ||
			contentType.includes('text/plain');

		const isMobile = event.request.headers.get('x-gidi-client') === 'mobile';

		// Mobile requests use bearer authentication rather than browser cookies.
		// Browser form submissions remain subject to the origin check.
		if (looksLikeForm && !isMobile && origin !== event.url.origin) {
			console.warn(
				`CSRF guard blocked ${event.request.method} ${event.url.pathname} (origin: ${origin ?? 'none'})`
			);

			return new Response(
				`Blocked by the Gidi Tour CSRF guard: ${event.request.method} ${event.url.pathname}`,
				{ status: 403 }
			);
		}
	}

	return resolve(event);
};

// Headers added to every response.
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	try {
		response.headers.set('X-Content-Type-Options', 'nosniff');
		response.headers.set('X-Frame-Options', 'SAMEORIGIN');
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set(
			'Permissions-Policy',
			'camera=(), microphone=(), geolocation=(), interest-cohort=()'
		);

		// Enforce HTTPS without affecting other subdomains.
		if (!dev && event.url.protocol === 'https:') {
			response.headers.set('Strict-Transport-Security', 'max-age=31536000');
		}
	} catch {
		// Some responses have locked headers.
	}

	return response;
};

export const handle = sequence(devCors, securityHeaders, csrfHandle, mobileBridge, authHandle);