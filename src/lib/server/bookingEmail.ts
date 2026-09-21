import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, BOOKING_NOTIFICATION_EMAIL } from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

interface BookingEmailInput {
	name: string;
	email: string;
	amountGBP?: number;
	amountCharged?: number;
	currency?: string;
	paymentMethod: 'stripe' | 'dlocal';
	bookingId?: string;
	destination?: string;
	startDate?: string;
	endDate?: string;
	travelers?: number;
	tripType?: string;
	tours?: {
		id?: string;
		title: string;
		price?: number;
		travelers?: number;
	}[];
}

function escapeHtml(value: unknown): string {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function formatDate(date?: string): string {
	if (!date) return 'To be confirmed';

	const parsed = new Date(`${date}T00:00:00`);

	if (Number.isNaN(parsed.getTime())) {
		return escapeHtml(date);
	}

	return parsed.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}

function formatPaymentAmount(
	amountCharged?: number,
	currency?: string,
	amountGBP?: number
): string {
	if (amountCharged !== undefined && currency) {
		return `${currency.toUpperCase()} ${(amountCharged / 100).toFixed(2)}`;
	}

	if (amountGBP !== undefined) {
		return `£${amountGBP.toFixed(2)}`;
	}

	return 'See booking details';
}

function getTourList(tours?: BookingEmailInput['tours']): string {
	if (!tours || tours.length === 0) {
		return `
			<tr>
				<td style="padding: 12px 0; color: #666;">
					Tour details will be confirmed by the Gidi Tour team.
				</td>
			</tr>
		`;
	}

	return tours
		.map(
			(tour) => `
				<tr>
					<td style="
						padding: 14px 0;
						border-bottom: 1px solid #eeeeee;
						font-size: 15px;
						color: #17200f;
					">
						<strong>${escapeHtml(tour.title)}</strong>
						${
							tour.travelers
								? `<span style="color:#777;"> · ${tour.travelers} traveler${
										tour.travelers > 1 ? 's' : ''
									}</span>`
								: ''
						}
					</td>
				</tr>
			`
		)
		.join('');
}

function baseStyles() {
	return `
		body {
			margin: 0;
			padding: 0;
			background: #f7f3ea;
			font-family: Arial, Helvetica, sans-serif;
			color: #17200f;
		}

		.wrapper {
			width: 100%;
			padding: 40px 16px;
			box-sizing: border-box;
		}

		.container {
			max-width: 620px;
			margin: 0 auto;
			background: #ffffff;
			border-radius: 24px;
			overflow: hidden;
			box-shadow: 0 8px 30px rgba(0,0,0,0.06);
		}

		@media only screen and (max-width: 640px) {
			.wrapper {
				padding: 20px 10px;
			}

			.container {
				border-radius: 18px;
			}

			.content {
				padding: 28px 22px !important;
			}

			.hero {
				padding: 28px 22px !important;
			}
		}
	`;
}

export async function sendBookingConfirmationEmails(booking: BookingEmailInput) {
	const safeName = escapeHtml(booking.name);
	const safeEmail = escapeHtml(booking.email);
	const safeDestination = escapeHtml(booking.destination || 'To be confirmed');
	const safeTravelers = escapeHtml(booking.travelers || 'To be confirmed');

	const paymentAmount = formatPaymentAmount(
		booking.amountCharged,
		booking.currency,
		booking.amountGBP
	);

	const tourList = getTourList(booking.tours);

	const dateRange = booking.startDate
		? `${formatDate(booking.startDate)}${
				booking.endDate ? ` – ${formatDate(booking.endDate)}` : ''
			}`
		: 'To be confirmed';

	/*
	|--------------------------------------------------------------------------
	| CUSTOMER EMAIL
	|--------------------------------------------------------------------------
	*/

	const customerEmail = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Your Gidi Tour booking is confirmed</title>

	<style>
		${baseStyles()}
	</style>
</head>

<body>

	<div class="wrapper">

		<div class="container">

			<!-- HEADER -->

			<div
				class="hero"
				style="
					background:#5C9B19;
					padding:38px 42px;
					text-align:center;
				"
			>

				<div
					style="
						display:inline-block;
						background:#ffffff;
						border-radius:999px;
						padding:10px 18px;
						font-size:20px;
						font-weight:800;
						color:#5C9B19;
						letter-spacing:-0.5px;
					"
				>
					Gidi Tour
				</div>

				<p
					style="
						margin:20px 0 0;
						color:#ffffff;
						font-size:13px;
						font-weight:700;
						letter-spacing:2px;
						text-transform:uppercase;
					"
				>
					Travel that feels like coming home.
				</p>

			</div>

			<!-- CONTENT -->

			<div
				class="content"
				style="padding:42px;"
			>

				<div
					style="
						width:54px;
						height:54px;
						border-radius:50%;
						background:#5C9B19;
						color:#ffffff;
						display:flex;
						align-items:center;
						justify-content:center;
						font-size:26px;
						margin-bottom:22px;
					"
				>
					✓
				</div>

				<h1
					style="
						margin:0;
						font-size:30px;
						line-height:1.15;
						letter-spacing:-1px;
						color:#17200f;
					"
				>
					You're booked, ${safeName}.
				</h1>

				<p
					style="
						margin:14px 0 0;
						font-size:16px;
						line-height:1.7;
						color:#687064;
					"
				>
					Your payment has been received and your Gidi Tour booking
					is now confirmed.
				</p>

				<!-- BOOKING ID -->

				<div
					style="
						margin-top:28px;
						padding:18px;
						border-radius:16px;
						background:#f7f3ea;
						border:1px solid #eee9dc;
					"
				>
					<div
						style="
							font-size:11px;
							font-weight:800;
							letter-spacing:1.5px;
							text-transform:uppercase;
							color:#5C9B19;
						"
					>
						Booking reference
					</div>

					<div
						style="
							margin-top:7px;
							font-size:15px;
							font-weight:700;
							color:#17200f;
							word-break:break-all;
						"
					>
						${escapeHtml(booking.bookingId || 'Processing')}
					</div>
				</div>

				<!-- TRIP -->

				<h2
					style="
						margin:34px 0 16px;
						font-size:18px;
						color:#17200f;
					"
				>
					Your trip
				</h2>

				<table
					width="100%"
					cellpadding="0"
					cellspacing="0"
					style="
						border-collapse:collapse;
						font-size:14px;
					"
				>

					<tr>
						<td
							style="
								padding:12px 0;
								border-bottom:1px solid #eeeeee;
								color:#777;
							"
						>
							Destination
						</td>

						<td
							align="right"
							style="
								padding:12px 0;
								border-bottom:1px solid #eeeeee;
								font-weight:700;
							"
						>
							${safeDestination}
						</td>
					</tr>

					<tr>
						<td
							style="
								padding:12px 0;
								border-bottom:1px solid #eeeeee;
								color:#777;
							"
						>
							Travel dates
						</td>

						<td
							align="right"
							style="
								padding:12px 0;
								border-bottom:1px solid #eeeeee;
								font-weight:700;
							"
						>
							${dateRange}
						</td>
					</tr>

					<tr>
						<td
							style="
								padding:12px 0;
								border-bottom:1px solid #eeeeee;
								color:#777;
							"
						>
							Travelers
						</td>

						<td
							align="right"
							style="
								padding:12px 0;
								border-bottom:1px solid #eeeeee;
								font-weight:700;
							"
						>
							${safeTravelers}
						</td>
					</tr>

				</table>

				<!-- TOURS -->

				<h2
					style="
						margin:34px 0 10px;
						font-size:18px;
						color:#17200f;
					"
				>
					Experiences
				</h2>

				<table
					width="100%"
					cellpadding="0"
					cellspacing="0"
					style="border-collapse:collapse;"
				>
					${tourList}
				</table>

				<!-- PAYMENT -->

				<div
					style="
						margin-top:30px;
						padding:24px;
						border-radius:18px;
						background:#17200f;
						color:#ffffff;
					"
				>

					<div
						style="
							font-size:11px;
							font-weight:800;
							letter-spacing:1.5px;
							text-transform:uppercase;
							color:#F98315;
						"
					>
						Payment received
					</div>

					<div
						style="
							margin-top:8px;
							font-size:28px;
							font-weight:800;
							color:#ffffff;
						"
					>
						${escapeHtml(paymentAmount)}
					</div>

					<div
						style="
							margin-top:8px;
							font-size:13px;
							color:#c7cfc1;
						"
					>
						Paid securely via ${escapeHtml(booking.paymentMethod)}
					</div>

				</div>

				<!-- NEXT STEPS -->

				<div
					style="
						margin-top:32px;
						padding:22px;
						border-left:4px solid #F98315;
						background:#fff8ef;
					"
				>

					<strong
						style="
							font-size:15px;
							color:#17200f;
						"
					>
						What's next?
					</strong>

					<p
						style="
							margin:8px 0 0;
							font-size:14px;
							line-height:1.7;
							color:#687064;
						"
					>
						Our team will review your booking and contact you with
						the next steps, itinerary details and anything else we
						need from you.
					</p>

				</div>

				<!-- CTA -->

				<div style="text-align:center;margin-top:34px;">

					<a
						href="https://giditour.com"
						style="
							display:inline-block;
							background:#5C9B19;
							color:#ffffff;
							text-decoration:none;
							padding:14px 26px;
							border-radius:999px;
							font-size:14px;
							font-weight:800;
						"
					>
						Visit Gidi Tour
					</a>

				</div>

			</div>

			<!-- FOOTER -->

			<div
				style="
					padding:28px 30px;
					background:#f7f3ea;
					text-align:center;
				"
			>

				<p
					style="
						margin:0;
						font-size:14px;
						font-weight:800;
						color:#17200f;
					"
				>
					Gidi Tour
				</p>

				<p
					style="
						margin:8px 0 0;
						font-size:12px;
						line-height:1.6;
						color:#777;
					"
				>
					Travel that feels like coming home.
				</p>

				<p
					style="
						margin:14px 0 0;
						font-size:11px;
						color:#999;
					"
				>
					This email confirms your payment and booking.
				</p>

			</div>

		</div>

	</div>

</body>
</html>
	`;

	/*
	|--------------------------------------------------------------------------
	| INTERNAL EMAIL
	|--------------------------------------------------------------------------
	*/

	const internalEmail = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<style>
		body {
			margin:0;
			padding:0;
			background:#f7f3ea;
			font-family:Arial, Helvetica, sans-serif;
			color:#17200f;
		}

		.container {
			max-width:650px;
			margin:30px auto;
			background:#ffffff;
			border-radius:22px;
			overflow:hidden;
		}
	</style>
</head>

<body>

	<div class="container">

		<div
			style="
				background:#17200f;
				padding:30px;
				text-align:center;
			"
		>

			<div
				style="
					display:inline-block;
					background:#ffffff;
					color:#5C9B19;
					padding:9px 16px;
					border-radius:999px;
					font-weight:800;
					font-size:18px;
				"
			>
				Gidi Tour
			</div>

			<p
				style="
					color:#F98315;
					font-size:12px;
					font-weight:800;
					letter-spacing:2px;
					text-transform:uppercase;
					margin:15px 0 0;
				"
			>
				New paid booking
			</p>

		</div>

		<div style="padding:35px;">

			<h1
				style="
					margin:0;
					font-size:27px;
					color:#17200f;
				"
			>
				New booking received 🔔
			</h1>

			<p
				style="
					font-size:15px;
					line-height:1.7;
					color:#687064;
				"
			>
				<strong>${safeName}</strong> has completed a paid booking
				through the Gidi Tour website.
			</p>

			<div
				style="
					margin-top:25px;
					padding:20px;
					background:#f7f3ea;
					border-radius:16px;
				"
			>

				<h2 style="font-size:16px;margin:0 0 14px;">
					Customer
				</h2>

				<p style="margin:7px 0;">
					<strong>Name:</strong> ${safeName}
				</p>

				<p style="margin:7px 0;">
					<strong>Email:</strong> ${safeEmail}
				</p>

			</div>

			<div
				style="
					margin-top:20px;
					padding:20px;
					background:#f7f3ea;
					border-radius:16px;
				"
			>

				<h2 style="font-size:16px;margin:0 0 14px;">
					Trip
				</h2>

				<p style="margin:7px 0;">
					<strong>Destination:</strong> ${safeDestination}
				</p>

				<p style="margin:7px 0;">
					<strong>Travel dates:</strong> ${dateRange}
				</p>

				<p style="margin:7px 0;">
					<strong>Travelers:</strong> ${safeTravelers}
				</p>

				<p style="margin:7px 0;">
					<strong>Booking ID:</strong>
					${escapeHtml(booking.bookingId || 'Not available')}
				</p>

			</div>

			<div
				style="
					margin-top:20px;
					padding:20px;
					background:#17200f;
					color:#ffffff;
					border-radius:16px;
				"
			>

				<p
					style="
						margin:0;
						color:#F98315;
						font-size:11px;
						font-weight:800;
						text-transform:uppercase;
						letter-spacing:1.5px;
					"
				>
					Payment
				</p>

				<p
					style="
						margin:8px 0 0;
						font-size:25px;
						font-weight:800;
					"
				>
					${escapeHtml(paymentAmount)}
				</p>

				<p
					style="
						margin:8px 0 0;
						color:#c7cfc1;
						font-size:13px;
					"
				>
					Provider: ${escapeHtml(booking.paymentMethod)}
				</p>

			</div>

			<h2
				style="
					margin:30px 0 12px;
					font-size:16px;
				"
			>
				Selected experiences
			</h2>

			<table
				width="100%"
				cellpadding="0"
				cellspacing="0"
				style="border-collapse:collapse;"
			>
				${tourList}
			</table>

		</div>

		<div
			style="
				padding:22px;
				background:#f7f3ea;
				text-align:center;
				font-size:12px;
				color:#777;
			"
		>
			Gidi Tour · Travel that feels like coming home.
		</div>

	</div>

</body>
</html>
	`;

	/*
	|--------------------------------------------------------------------------
	| SEND CUSTOMER EMAIL
	|--------------------------------------------------------------------------
	*/

	const customerResult = await resend.emails.send({
		from: RESEND_FROM_EMAIL,
		to: booking.email,
		subject: 'Your Gidi Tour booking is confirmed 🎉',
		html: customerEmail
	});

	if (customerResult.error) {
		console.error('Customer booking email failed:', customerResult.error);

		throw new Error('Customer confirmation email failed.');
	}

	/*
	|--------------------------------------------------------------------------
	| SEND INTERNAL NOTIFICATION
	|--------------------------------------------------------------------------
	*/

	if (BOOKING_NOTIFICATION_EMAIL) {
		const internalResult = await resend.emails.send({
			from: RESEND_FROM_EMAIL,
			to: BOOKING_NOTIFICATION_EMAIL,
			subject: `New Gidi Tour booking — ${booking.name}`,
			html: internalEmail
		});

		if (internalResult.error) {
			console.error('Internal booking notification failed:', internalResult.error);

			throw new Error('Internal booking notification failed.');
		}
	}
}
