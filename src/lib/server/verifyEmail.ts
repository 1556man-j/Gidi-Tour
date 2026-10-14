import crypto from 'node:crypto';
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private';
import { setVerifyToken } from '$lib/sanity/queries/customer';
import { SITE_URL } from '$lib/server/siteUrl';

const resend = new Resend(RESEND_API_KEY);

export function hashToken(token: string) {
	return crypto.createHash('sha256').update(token).digest('hex');
}

/** Creates a 24 hour confirmation link for the customer and emails it. */
export async function issueEmailVerification(
	customerId: string,
	email: string,
	name: string | undefined
) {
	const token = crypto.randomBytes(32).toString('hex');
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

	// Only the hash is stored, so a database leak can't be used to confirm emails.
	await setVerifyToken(customerId, hashToken(token), expiresAt);

	const url = `${SITE_URL}/verify-email?token=${encodeURIComponent(token)}`;

	await sendVerificationEmail(email, name, url);
}

async function sendVerificationEmail(email: string, name: string | undefined, url: string) {
	const safeName = escapeHtml(name || 'there');

	const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#17200f;">
	<div style="width:100%;padding:40px 16px;box-sizing:border-box;">
		<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
			<div style="background:#5C9B19;padding:38px 42px;text-align:center;">
				<div style="display:inline-block;background:#ffffff;border-radius:999px;padding:10px 18px;font-size:20px;font-weight:800;color:#5C9B19;">Gidi Tour</div>
			</div>
			<div style="padding:42px;">
				<h1 style="margin:0;font-size:30px;line-height:1.15;color:#17200f;">Confirm your email</h1>
				<p style="margin:16px 0 0;font-size:16px;line-height:1.7;color:#687064;">
					Hi ${safeName}, thanks for creating a Gidi Tour account. Please confirm your email address so you can log in and book.
				</p>
				<p style="margin:16px 0 0;font-size:15px;line-height:1.7;color:#687064;">This link expires after 24 hours.</p>
				<div style="text-align:center;margin-top:32px;">
					<a href="${url}" style="display:inline-block;background:#5C9B19;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:800;">Confirm my email</a>
				</div>
				<p style="margin:28px 0 0;font-size:12px;line-height:1.6;color:#999;word-break:break-all;">
					If the button doesn't work, copy and paste this link into your browser:<br />${url}
				</p>
				<p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#687064;">
					If you didn't create this account, you can ignore this email.
				</p>
			</div>
		</div>
	</div>
</body>
</html>`;

	const result = await resend.emails.send({
		from: RESEND_FROM_EMAIL,
		to: email,
		subject: 'Confirm your Gidi Tour email',
		html
	});

	if (result.error) {
		console.error('Verification email failed:', result.error);
		throw new Error('Verification email failed.');
	}
}

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
