
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { SLACK_VISITOR_WEBHOOK_URL } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const webhookUrl = SLACK_VISITOR_WEBHOOK_URL;

		if (!webhookUrl) {
			console.error('SLACK_VISITOR_WEBHOOK_URL is not configured');
			return json({ success: false }, { status: 500 });
		}

		const body = await request.json();

		const page = typeof body.page === 'string' ? body.page : 'Unknown page';
		const title = typeof body.title === 'string' ? body.title : 'Gidi Tour';
		const referrer = typeof body.referrer === 'string' ? body.referrer : 'Direct';
		const userAgent = typeof body.userAgent === 'string' ? body.userAgent : 'Unknown';
		const screen = typeof body.screen === 'string' ? body.screen : 'Unknown';
		const timezone = typeof body.timezone === 'string' ? body.timezone : 'Unknown';

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