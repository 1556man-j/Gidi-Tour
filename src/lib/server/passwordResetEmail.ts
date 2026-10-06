import { Resend } from 'resend';
import {
	RESEND_API_KEY,
	RESEND_FROM_EMAIL
} from '$env/static/private';

const resend = new Resend(RESEND_API_KEY);

export async function sendPasswordResetEmail(
	email: string,
	name: string | undefined,
	resetUrl: string
) {

	const safeName = escapeHtml(name || 'there');

	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />

	<style>
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
			box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
		}

		@media only screen and (max-width: 640px) {
			.wrapper {
				padding: 20px 10px;
			}

			.content {
				padding: 28px 22px !important;
			}

			.hero {
				padding: 28px 22px !important;
			}
		}
	</style>
</head>

<body>

	<div class="wrapper">
		<div class="container">

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

			<div
				class="content"
				style="padding:42px;"
			>
				<h1
					style="
						margin:0;
						font-size:30px;
						line-height:1.15;
						color:#17200f;
					"
				>
					Reset your password
				</h1>

				<p
					style="
						margin:16px 0 0;
						font-size:16px;
						line-height:1.7;
						color:#687064;
					"
				>
					Hi ${safeName}, we received a request to reset the password
					for your Gidi Tour account.
				</p>

				<p
					style="
						margin:16px 0 0;
						font-size:15px;
						line-height:1.7;
						color:#687064;
					"
				>
					Click the button below to choose a new password.
					This link will expire after 30 minutes.
				</p>

				<div style="text-align:center;margin-top:32px;">
					<a
						href="${resetUrl}"
						style="
							display:inline-block;
							background:#5C9B19;
							color:#ffffff;
							text-decoration:none;
							padding:14px 28px;
							border-radius:999px;
							font-size:14px;
							font-weight:800;
						"
					>
						Reset password
					</a>
				</div>

				<div
					style="
						margin-top:32px;
						padding:20px;
						border-left:4px solid #F98315;
						background:#fff8ef;
					"
				>
					<p
						style="
							margin:0;
							font-size:13px;
							line-height:1.7;
							color:#687064;
						"
					>
						If you didn't request a password reset, you can safely
						ignore this email. Your password will remain unchanged.
					</p>
				</div>

				<p
					style="
						margin:28px 0 0;
						font-size:12px;
						line-height:1.6;
						color:#999;
						word-break:break-all;
					"
				>
					If the button doesn't work, copy and paste this link into
					your browser:<br />
					${resetUrl}
				</p>
			</div>

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
						color:#777;
					"
				>
					Travel that feels like coming home.
				</p>
			</div>

		</div>
	</div>

</body>
</html>
	`;

	const result = await resend.emails.send({
		from: RESEND_FROM_EMAIL,
		to: email,
		subject: 'Reset your Gidi Tour password',
		html
	});

	if (result.error) {
		console.error('Password reset email failed:', result.error);
		throw new Error('Password reset email failed.');
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