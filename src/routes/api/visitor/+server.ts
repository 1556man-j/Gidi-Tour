
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SLACK_VISITOR_WEBHOOK_URL } from '$env/static/private';
import { isRateLimited, ipOf } from '$lib/server/rateLimit';

// Slack treats & < > as special (links, @channel mentions), and anyone can call
// this route, so everything is shortened and neutralised first.
const clean = (value: string, max = 300) =>
	value.slice(0, max).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	// Over the limit: pretend it worked, so the page doesn't show an error.
	if (await isRateLimited(`visitor:${ipOf(getClientAddress)}`, 30, 3600)) {
		return json({ success: true });
	}

	try {
		const webhookUrl = SLACK_VISITOR_WEBHOOK_URL;

		if (!webhookUrl) {
			console.error('SLACK_VISITOR_WEBHOOK_URL is not configured');
			return json({ success: false }, { status: 500 });
		}

		const body = await request.json();

		const page = typeof body.page === 'string' ? clean(body.page) : 'Unknown page';
		const title = typeof body.title === 'string' ? clean(body.title) : 'Gidi Tour';
		const referrer = typeof body.referrer === 'string' ? clean(body.referrer) : 'Direct';
		const userAgent = typeof body.userAgent === 'string' ? clean(body.userAgent) : 'Unknown';
		const screen = typeof body.screen === 'string' ? clean(body.screen) : 'Unknown';
		const timezone = typeof body.timezone === 'string' ? clean(body.timezone) : 'Unknown';

		const visitedAt = new Date().toLocaleString('en-GB', {
			timeZone: 'Africa/Lagos',
			dateStyle: 'medium',
			timeStyle: 'short'
		});

		const message = {
			text: [
				'🔔 *New Gidi Tour visitor*',
				'',
				`*Time:* ${visitedAt} WAT`,
				`*Page:* ${title}`,
				`*URL:* ${page}`,
				`*Referrer:* ${referrer}`,
				`*Device:* ${userAgent}`,
				`*Screen:* ${screen}`,
				`*Timezone:* ${timezone}`
			].join('\n')
		};

		const response = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(message)
		});

		if (!response.ok) {
			console.error('Slack webhook failed:', await response.text());
			return json({ success: false }, { status: 502 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Visitor notification error:', error);
		return json({ success: false }, { status: 500 });
	}
};