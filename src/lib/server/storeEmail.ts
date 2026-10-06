import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, BOOKING_NOTIFICATION_EMAIL } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

interface StoreOrderEmailItem {
	title: string;
	category: 'magazine' | 'merchandise';
	price: number;
	quantity: number;
	variant?: string;
}

interface StoreOrderEmailInput {
	name: string;
	email: string;
	orderId: string;
	items: StoreOrderEmailItem[];
	subtotal: number;
	amountCharged?: number;
	currency?: string;
	paymentMethod: 'stripe' | 'dlocal';
	shipping?: {
		address: string;
		city: string;
		country: string;
		postcode: string;
	} | null;
	// slug -> permanent download URL, for any magazine items in the order
	downloadLinks?: { title: string; url: string }[];
}

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function formatPaymentAmount(amountCharged?: number, currency?: string, subtotal?: number): string {
	if (amountCharged !== undefined && currency) {
		return `${currency.toUpperCase()} ${(amountCharged / 100).toFixed(2)}`;
	}
	if (subtotal !== undefined) {
		return `£${subtotal.toFixed(2)}`;
	}
	return 'See order details';
}

function getItemList(items: StoreOrderEmailItem[]): string {
	if (!items || items.length === 0) {
		return `<tr><td style="padding:12px 0;color:#666;">Order details will be confirmed by the Gidi Tour team.</td></tr>`;
	}

	return items
		.map(
			(item) => `
				<tr>
					<td style="padding:14px 0;border-bottom:1px solid #eeeeee;font-size:15px;color:#17200f;">
						<strong>${escapeHtml(item.title)}</strong>
						${item.variant ? `<span style="color:#777;"> · ${escapeHtml(item.variant)}</span>` : ''}
						<span style="color:#777;"> · Qty ${escapeHtml(item.quantity)}</span>
						<span style="color:#777;"> · ${escapeHtml(item.category === 'magazine' ? 'Digital issue' : 'Merchandise')}</span>
					</td>
				</tr>
			`
		)
		.join('');
}

function getDownloadSection(downloadLinks?: { title: string; url: string }[]): string {
	if (!downloadLinks || downloadLinks.length === 0) return '';

	const links = downloadLinks
		.map(
			(link) => `
				<div style="margin-top:12px;">
					<a href="${escapeHtml(link.url)}" style="color:#5C9B19;font-weight:700;text-decoration:none;">
						Download: ${escapeHtml(link.title)} →
					</a>
				</div>
			`
		)
		.join('');

	return `
		<div style="margin-top:30px;padding:24px;border-radius:18px;background:#f7f3ea;border:1px solid #eee9dc;">
			<div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#5C9B19;">
				Your downloads
			</div>
			<p style="margin:8px 0 0;font-size:13px;color:#687064;">
				These links are yours permanently — bookmark this email or come back to it any time.
			</p>
			${links}
		</div>
	`;
}

function getShippingSection(shipping?: StoreOrderEmailInput['shipping']): string {
	if (!shipping) return '';

	return `
		<h2 style="margin:34px 0 16px;font-size:18px;color:#17200f;">Shipping to</h2>
		<div style="padding:18px;border-radius:16px;background:#f7f3ea;border:1px solid #eee9dc;font-size:14px;color:#17200f;line-height:1.7;">
			${escapeHtml(shipping.address)}<br />
			${escapeHtml(shipping.city)}, ${escapeHtml(shipping.postcode)}<br />
			${escapeHtml(shipping.country)}
		</div>
	`;
}

function baseStyles() {
	return `
		body { margin:0; padding:0; background:#f7f3ea; font-family:Arial, Helvetica, sans-serif; color:#17200f; }
		.wrapper { width:100%; padding:40px 16px; box-sizing:border-box; }
		.container { max-width:620px; margin:0 auto; background:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.06); }
		@media only screen and (max-width:640px) {
			.wrapper { padding:20px 10px; }
			.container { border-radius:18px; }
			.content { padding:28px 22px !important; }
			.hero { padding:28px 22px !important; }
		}
	`;
}

export async function sendStoreOrderConfirmationEmails(order: StoreOrderEmailInput) {
	const safeName = escapeHtml(order.name);
	const safeEmail = escapeHtml(order.email);
	const paymentAmount = formatPaymentAmount(order.amountCharged, order.currency, order.subtotal);
	const itemList = getItemList(order.items);
	const downloadSection = getDownloadSection(order.downloadLinks);
	const shippingSection = getShippingSection(order.shipping);

	/* CUSTOMER EMAIL */
	const customerEmail = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Your Gidi Tour Store order is confirmed</title>
	<style>${baseStyles()}</style>
</head>
<body>
	<div class="wrapper">
		<div class="container">
			<div class="hero" style="background:#5C9B19;padding:38px 42px;text-align:center;">
				<div style="display:inline-block;background:#ffffff;border-radius:999px;padding:10px 18px;font-size:20px;font-weight:800;color:#5C9B19;letter-spacing:-0.5px;">
					Gidi Tour
				</div>
				<p style="margin:20px 0 0;color:#ffffff;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">
					Read it. Wear it. Take it with you.
				</p>
			</div>

			<div class="content" style="padding:42px;">
				<div style="width:54px; height:54px;
					border-radius:50%;
					background:#5C9B19;
					color:#ffffff;
					font-size:26px;
					font-weight:bold;
					line-height:54px;
					text-align:center;
					margin:0 auto 22px;">✓</div>

				<h1 style="margin:0;font-size:30px;line-height:1.15;letter-spacing:-1px;color:#17200f;">
					Thanks, ${safeName}.
				</h1>
				<p style="margin:14px 0 0;font-size:16px;line-height:1.7;color:#687064;">
					Your payment has been received and your Gidi Tour Store order is confirmed.
				</p>

				<div style="margin-top:28px;padding:18px;border-radius:16px;background:#f7f3ea;border:1px solid #eee9dc;">
					<div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#5C9B19;">
						Order reference
					</div>
					<div style="margin-top:7px;font-size:15px;font-weight:700;color:#17200f;word-break:break-all;">
						${escapeHtml(order.orderId)}
					</div>
				</div>

				<h2 style="margin:34px 0 10px;font-size:18px;color:#17200f;">Your order</h2>
				<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
					${itemList}
				</table>

				${downloadSection}
				${shippingSection}

				<div style="margin-top:30px;padding:24px;border-radius:18px;background:#17200f;color:#ffffff;">
					<div style="font-size:11px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:#F98315;">
						Payment received
					</div>
					<div style="margin-top:8px;font-size:28px;font-weight:800;color:#ffffff;">
						${escapeHtml(paymentAmount)}
					</div>
					<div style="margin-top:8px;font-size:13px;color:#c7cfc1;">
						Paid securely via ${escapeHtml(order.paymentMethod)}
					</div>
				</div>

				${
					order.shipping
						? `
					<div style="margin-top:32px;padding:22px;border-left:4px solid #F98315;background:#fff8ef;">
						<strong style="font-size:15px;color:#17200f;">What's next?</strong>
						<p style="margin:8px 0 0;font-size:14px;line-height:1.7;color:#687064;">
							We'll email you tracking details once your merchandise ships.
						</p>
					</div>
				`
						: ''
				}

				<div style="text-align:center;margin-top:34px;">
					<a href="https://giditour.com/store" style="display:inline-block;background:#5C9B19;color:#ffffff;text-decoration:none;padding:14px 26px;border-radius:999px;font-size:14px;font-weight:800;">
						Visit the Store
					</a>
				</div>
			</div>

			<div style="padding:28px 30px;background:#f7f3ea;text-align:center;">
				<p style="margin:0;font-size:14px;font-weight:800;color:#17200f;">Gidi Tour</p>
				<p style="margin:8px 0 0;font-size:12px;line-height:1.6;color:#777;">Travel that feels like coming home.</p>
				<p style="margin:14px 0 0;font-size:11px;color:#999;">This email confirms your payment and order.</p>
			</div>
		</div>
	</div>
</body>
</html>
	`;

	/* INTERNAL EMAIL */
	const internalEmail = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<style>
		body { margin:0; padding:0; background:#f7f3ea; font-family:Arial, Helvetica, sans-serif; color:#17200f; }
		.container { max-width:650px; margin:30px auto; background:#ffffff; border-radius:22px; overflow:hidden; }
	</style>
</head>
<body>
	<div class="container">
		<div style="background:#17200f;padding:30px;text-align:center;">
			<div style="display:inline-block;background:#ffffff;color:#5C9B19;padding:9px 16px;border-radius:999px;font-weight:800;font-size:18px;">
				Gidi Tour
			</div>
			<p style="color:#F98315;font-size:12px;font-weight:800;letter-spacing:2px;text-transform:uppercase;margin:15px 0 0;">
				New paid store order
			</p>
		</div>

		<div style="padding:35px;">
			<h1 style="margin:0;font-size:27px;color:#17200f;">New order received 🔔</h1>
			<p style="font-size:15px;line-height:1.7;color:#687064;">
				<strong>${safeName}</strong> has completed a paid order in the Gidi Tour Store.
			</p>

			<div style="margin-top:25px;padding:20px;background:#f7f3ea;border-radius:16px;">
				<h2 style="font-size:16px;margin:0 0 14px;">Customer</h2>
				<p style="margin:7px 0;"><strong>Name:</strong> ${safeName}</p>
				<p style="margin:7px 0;"><strong>Email:</strong> ${safeEmail}</p>
				<p style="margin:7px 0;"><strong>Order ID:</strong> ${escapeHtml(order.orderId)}</p>
			</div>

			${shippingSection}

			<div style="margin-top:20px;padding:20px;background:#17200f;color:#ffffff;border-radius:16px;">
				<p style="margin:0;color:#F98315;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1.5px;">Payment</p>
				<p style="margin:8px 0 0;font-size:25px;font-weight:800;">${escapeHtml(paymentAmount)}</p>
				<p style="margin:8px 0 0;color:#c7cfc1;font-size:13px;">Provider: ${escapeHtml(order.paymentMethod)}</p>
			</div>

			<h2 style="margin:30px 0 12px;font-size:16px;">Items</h2>
			<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
				${itemList}
			</table>
		</div>

		<div style="padding:22px;background:#f7f3ea;text-align:center;font-size:12px;color:#777;">
			Gidi Tour · Travel that feels like coming home.
		</div>
	</div>
</body>
</html>
	`;

	const customerResult = await resend.emails.send({
		from: RESEND_FROM_EMAIL,
		to: order.email,
		subject: 'Your Gidi Tour Store order is confirmed 🎉',
		html: customerEmail
	});

	if (customerResult.error) {
		console.error('Customer store order email failed:', customerResult.error);
		throw new Error('Customer confirmation email failed.');
	}

	if (BOOKING_NOTIFICATION_EMAIL) {
		const internalResult = await resend.emails.send({
			from: RESEND_FROM_EMAIL,
			to: BOOKING_NOTIFICATION_EMAIL,
			subject: `New Gidi Tour Store order — ${order.name}`,
			html: internalEmail
		});

		if (internalResult.error) {
			console.error('Internal store order notification failed:', internalResult.error);
			throw new Error('Internal store order notification failed.');
		}
	}
}
