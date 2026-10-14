import { handle as authHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';

// These are called by dLocal / Stripe from outside our site, so they cannot
// pass an origin check. None of them marks anything as paid because of the
// request itself: payments are confirmed only by the provider's own server-side
// verification (see paymentSettlement.ts).
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

const csrfHandle: Handle = async ({ event, resolve }) => {
	const path = normalizePath(event.url.pathname);
	const isExempt = CSRF_EXEMPT_PATHS.has(path);

	if (!isExempt && event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		const origin = event.request.headers.get('origin');
		const contentType = event.request.headers.get('content-type') ?? '';

		// Only check requests that look like form submissions, which matches
		// SvelteKit's own default behaviour, scoped with the exemption list.
		const looksLikeForm =
			contentType.includes('application/x-www-form-urlencoded') ||
			contentType.includes('multipart/form-data') ||
			contentType.includes('text/plain');

		if (looksLikeForm && origin !== event.url.origin) {
			console.warn(
				`CSRF guard blocked ${event.request.method} ${event.url.pathname} (origin: ${origin ?? 'none'})`
			);

			// This message is different from SvelteKit's built-in one on purpose, so you
			// can tell which layer blocked a request.
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
		response.headers.set('X-Frame-Options', 'SAMEORIGIN'); // nobody can embed the site in a frame
		response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
		response.headers.set(
			'Permissions-Policy',
			'camera=(), microphone=(), geolocation=(), interest-cohort=()'
		);

		// Tells browsers to use https only. No includeSubDomains, so other subdomains are not affected.
		if (!dev && event.url.protocol === 'https:') {
			response.headers.set('Strict-Transport-Security', 'max-age=31536000');
		}
	} catch {
		// Some responses have locked headers. They are skipped, never an error for the customer.
	}

	return response;
};

export const handle = sequence(securityHeaders, csrfHandle, authHandle);
