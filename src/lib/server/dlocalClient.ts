import crypto from 'node:crypto';
import { DLOCAL_X_LOGIN, DLOCAL_X_TRANS_KEY, DLOCAL_SECRET_KEY } from '$env/static/private';

const DLOCAL_API_BASE = 'https://sandbox.dlocal.com'; // switch to https://api.dlocal.com when going live

export function dlocalHeaders(bodyString: string) {
	const date = new Date().toISOString();
	const signaturePayload = `${DLOCAL_X_LOGIN}${date}${bodyString}`;
	const signature = crypto.createHmac('sha256', DLOCAL_SECRET_KEY).update(signaturePayload).digest('hex');

	return {
		'Content-Type': 'application/json',
		'X-Date': date,
		'X-Login': DLOCAL_X_LOGIN,
		'X-Trans-Key': DLOCAL_X_TRANS_KEY,
		'X-Version': '2.1',
		Authorization: `V2-HMAC-SHA256, Signature: ${signature}`
	};
}

export { DLOCAL_API_BASE };