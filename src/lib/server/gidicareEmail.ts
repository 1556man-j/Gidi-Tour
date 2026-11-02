import { Resend } from 'resend';
import {
	RESEND_API_KEY,
	RESEND_FROM_EMAIL,
	BOOKING_NOTIFICATION_EMAIL
} from '$env/static/private';
import { SITE_URL } from '$lib/server/siteUrl';

const resend = new Resend(RESEND_API_KEY);

export interface GidiCareEmailInput {
	donationId: string;
	name: string;
	email: string;
	message?: string | null;
	anonymous: boolean;
	amountGBP: number;
	amountCharged?: number; // smallest unit, for example pence or kobo
	currency?: string;
	paymentMethod: string;
	caseSlug?: string | null;
	caseTitle?: string;
}

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function money(amount: number, currency: string) {
	try {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency,
			maximumFractionDigits: currency === 'GBP' ? 2 : 0
		}).format(amount);
	} catch {
		return `${amount} ${currency}`;
	}
}

function amountLine(input: GidiCareEmailInput) {
	if (input.amountCharged && input.currency) {
		return money(input.amountCharged / 100, input.currency.toUpperCase());
	}
	return money(input.amountGBP, 'GBP');
}

export async function sendGidiCareDonationEmails(input: GidiCareEmailInput) {
	const forWho = input.caseTitle ? `to help ${input.caseTitle}` : 'to the GidiCare fund';
	const amount = amountLine(input);

	const donorHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#17200f;">
	<div style="width:100%;padding:40px 16px;box-sizing:border-box;">
		<div style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:24px;overflow:hidden;">
			<div style="background:#5C9B19;padding:38px 42px;text-align:center;">
				<div style="display:inline-block;background:#ffffff;border-radius:999px;padding:10px 18px;font-size:20px;font-weight:800;color:#5C9B19;">GidiCare</div>
			</div>
			<div style="padding:42px;">
				<h1 style="margin:0;font-size:30px;line-height:1.15;color:#17200f;">Thank you, ${escapeHtml(input.name.split(/\s+/)[0] || 'friend')}</h1>
				<p style="margin:16px 0 0;font-size:16px;line-height:1.7;color:#687064;">
					Your donation of <strong style="color:#17200f;">${escapeHtml(amount)}</strong> ${escapeHtml(forWho)} has been received. Because of supporters like you, stray and injured animals get the care they need.
				</p>
				<table style="margin-top:24px;width:100%;border-collapse:collapse;font-size:14px;">
					<tr><td style="padding:8px 0;color:#687064;">Reference</td><td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(input.donationId)}</td></tr>
					<tr><td style="padding:8px 0;color:#687064;">Amount</td><td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(amount)}</td></tr>
					<tr><td style="padding:8px 0;color:#687064;">Paid with</td><td style="padding:8px 0;text-align:right;font-weight:700;">${escapeHtml(input.paymentMethod === 'dlocal' ? 'dLocal' : 'Card or wallet (Stripe)')}</td></tr>
				</table>
				<p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#687064;">
					Please keep this email as your record of the donation. If anything looks wrong, reply to this email and quote the reference.
				</p>
				<div style="text-align:center;margin-top:28px;">
					<a href="${SITE_URL}/gidicare" style="display:inline-block;background:#5C9B19;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:800;">See who we're helping</a>
				</div>
			</div>
		</div>
	</div>
</body>
</html>`;

	const teamHtml = `
<div style="font-family:Arial,Helvetica,sans-serif;color:#17200f;max-width:560px;">
	<h2 style="margin:0 0 12px;">New GidiCare donation</h2>
	<p><strong>${escapeHtml(amount)}</strong> ${escapeHtml(forWho)}</p>
	<table style="font-size:14px;border-collapse:collapse;">
		<tr><td style="padding:4px 12px 4px 0;color:#687064;">Donor</td><td>${escapeHtml(input.name)} (${escapeHtml(input.email)})</td></tr>
		<tr><td style="padding:4px 12px 4px 0;color:#687064;">Anonymous</td><td>${input.anonymous ? 'Yes, do not show the name publicly' : 'No'}</td></tr>
		<tr><td style="padding:4px 12px 4px 0;color:#687064;">In pounds</td><td>${escapeHtml(money(input.amountGBP, 'GBP'))}</td></tr>
		<tr><td style="padding:4px 12px 4px 0;color:#687064;">Paid with</td><td>${escapeHtml(input.paymentMethod)}</td></tr>
		<tr><td style="padding:4px 12px 4px 0;color:#687064;">Reference</td><td>${escapeHtml(input.donationId)}</td></tr>
	</table>
	${input.message ? `<p style="margin-top:16px;"><strong>Message from the donor:</strong><br />${escapeHtml(input.message)}</p>` : ''}
</div>`;

	const donor = await resend.emails.send({
		from: RESEND_FROM_EMAIL,
		to: input.email,
		subject: 'Thank you for your GidiCare donation',
		html: donorHtml
	});

	if (donor.error) {
		console.error('GidiCare donor email failed:', donor.error);
		throw new Error('GidiCare donor email failed.');
	}

	// The team email is a courtesy. If it fails the donor still got their thank-you.
	const team = await resend.emails.send({
		from: RESEND_FROM_EMAIL,
		to: BOOKING_NOTIFICATION_EMAIL,
		subject: `New GidiCare donation: ${amount}`,
		html: teamHtml,
		replyTo: input.email
	});

	if (team.error) console.error('GidiCare team email failed:', team.error);
}
