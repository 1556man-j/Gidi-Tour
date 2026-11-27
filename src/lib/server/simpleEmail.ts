import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export const esc = (s: string) =>
	s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A short, on-brand email: a heading, a paragraph and an optional button. */
export async function sendSimpleEmail(to: string, subject: string, heading: string, text: string, button?: { label: string; url: string }) {
	const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f7f3ea;font-family:Arial,Helvetica,sans-serif;color:#17200f;">
<div style="padding:40px 16px;"><div style="max-width:560px;margin:0 auto;background:#fff;border-radius:24px;overflow:hidden;">
<div style="background:#5C9B19;padding:30px;text-align:center;"><span style="display:inline-block;background:#fff;border-radius:999px;padding:8px 16px;font-size:18px;font-weight:800;color:#5C9B19;">Gidi Tour</span></div>
<div style="padding:36px;"><h1 style="margin:0;font-size:26px;line-height:1.2;">${esc(heading)}</h1>
<p style="margin:14px 0 0;font-size:16px;line-height:1.7;color:#687064;">${esc(text)}</p>
${button ? `<div style="text-align:center;margin-top:28px;"><a href="${button.url}" style="display:inline-block;background:#5C9B19;color:#fff;text-decoration:none;padding:14px 28px;border-radius:999px;font-size:14px;font-weight:800;">${esc(button.label)}</a></div>` : ''}
</div></div></div></body></html>`;
	await resend.emails.send({ from: RESEND_FROM_EMAIL, to, subject, html });
}
