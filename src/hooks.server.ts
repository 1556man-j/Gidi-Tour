import { handle as authHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';

// These are called by dLocal / Stripe from outside our site.
const CSRF_EXEMPT_PATHS = new Set([
	'/api/book/dlocal/return',
	'/api/book/dlocal/webhook',
	'/api/book/stripe/webhook',
	'/api/store/checkout/dlocal/return',
	'/api/store/checkout/dlocal/webhook'
]);

const csrfHandle: Handle = async ({ event, resolve }) => {
	const isExempt = CSRF_EXEMPT_PATHS.has(event.url.pathname);

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
			return new Response('Cross-site POST form submissions are forbidden', { status: 403 });
		}
	}

	return resolve(event);
};

export const handle = sequence(csrfHandle, authHandle);