import type { RequestHandler } from './$types';
import { isRateLimited, ipOf } from '$lib/server/rateLimit';

// Browsers send a small report here when the Content Security Policy would
// block something. It only writes a line to your server logs.
export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (await isRateLimited(`csp:${ipOf(getClientAddress)}`, 100, 3600)) {
		return new Response(null, { status: 204 });
	}

	try {
		const text = (await request.text()).slice(0, 2000);
		const report = JSON.parse(text)?.['csp-report'];

		if (report) {
			console.warn(
				`CSP violation: ${report['violated-directive']} blocked ${report['blocked-uri'] || 'inline'} on ${report['document-uri']}`
			);
		} else {
			console.warn('CSP report:', text.slice(0, 300));
		}
	} catch {
		// Not a valid report. Ignore it.
	}

	return new Response(null, { status: 204 });
};
