import { handle as authHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';


const CSRF_EXEMPT_PATHS = [
	'/api/book/dlocal/return',
	'/api/book/dlocal/webhook',
	'/api/book/stripe/webhook',
    '/api/store/checkout/dlocal/webhook',
	'/api/store/checkout/dlocal/return'
];

const csrfHandle: Handle = async ({ event, resolve }) => {
	const isExempt = CSRF_EXEMPT_PATHS.some((path) => event.url.pathname.startsWith(path));

	if (!isExempt && event.request.method !== 'GET' && event.request.method !== 'HEAD') {
		const origin = event.request.headers.get('origin');
		const contentType = event.request.headers.get('content-type') ?? '';

		// Only check requests that look like form submissions — matches
		// SvelteKit's own default behavior, just scoped with our exemption list.
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