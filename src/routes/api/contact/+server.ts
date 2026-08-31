import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { RESEND_API_KEY } from '$env/static/private';

const COMPANY_EMAIL = 'delivered@resend.dev'; // where enquiries land

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json().catch(() => null);

	if (!body) {
		return json({ error: 'Invalid request body.' }, { status: 400 });
	}

	const { name, email, phone, interest, message } = body as {
		name?: string;
		email?: string;
		phone?: string;
		interest?: string;
		message?: string;
	};

	// Server-side validation — never trust the client alone
	const fieldErrors: Record<string, string> = {};

	if (!name || name.trim().length < 2) {
		fieldErrors.name = 'Please enter your full name.';
	}
	if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
		fieldErrors.email = 'Please enter a valid email address.';
	}
	if (!message || message.trim().length < 10) {
		fieldErrors.message = 'Message should be at least 10 characters.';
	}
	// phone is optional, but if provided, do a loose international sanity check
	// (allows +, digits, spaces, dashes, parens — not tied to any one country)
	if (phone && phone.trim() && !/^[+\d][\d\s().-]{6,20}$/.test(phone.trim())) {
		fieldErrors.phone = 'Please enter a valid phone number.';
	}

	if (Object.keys(fieldErrors).length > 0) {
		return json({ error: 'Please fix the highlighted fields.', fieldErrors }, { status: 400 });
	}

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: 'Gidi Tour Website <onboarding@resend.dev>',
				to: COMPANY_EMAIL,
				reply_to: email,
				subject: `New enquiry from ${name}${interest ? ` — ${interest}` : ''}`,
				html: `
		<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<title>New Gidi Tour Enquiry</title>
		</head>

		<body
			style="
				margin:0;
				padding:0;
				background-color:#f7f3ea;
				font-family:Arial,Helvetica,sans-serif;
				color:#17200f;
			"
		>
			<table
				width="100%"
				cellpadding="0"
				cellspacing="0"
				border="0"
				style="background-color:#f7f3ea;padding:40px 16px;"
			>
				<tr>
					<td align="center">

						<table
							width="100%"
							cellpadding="0"
							cellspacing="0"
							border="0"
							style="
								max-width:620px;
								background:#ffffff;
								border-radius:24px;
								overflow:hidden;
								box-shadow:0 8px 30px rgba(23,32,15,0.08);
							"
						>

							<!-- HEADER -->
							<tr>
								<td
									style="
										background:#17200f;
										padding:32px 36px;
									"
								>
									<table width="100%" cellpadding="0" cellspacing="0">
										<tr>
											<td>
												<div
													style="
														font-size:24px;
														font-weight:700;
														letter-spacing:-0.5px;
														color:#ffffff;
													"
												>
													Gidi<span style="color:#F98315;">Tour</span>
												</div>

												<div
													style="
														margin-top:8px;
														font-size:11px;
														font-weight:700;
														letter-spacing:2px;
														text-transform:uppercase;
														color:#F98315;
													"
												>
													New Website Enquiry
												</div>
											</td>
										</tr>
									</table>
								</td>
							</tr>

							<!-- INTRO -->
							<tr>
								<td style="padding:36px 36px 20px;">
									<div
										style="
											display:inline-block;
											padding:7px 12px;
											border-radius:999px;
											background:#5C9B19;
											color:#ffffff;
											font-size:10px;
											font-weight:700;
											letter-spacing:1px;
											text-transform:uppercase;
										"
									>
										Contact Form
									</div>

									<h1
										style="
											margin:18px 0 10px;
											font-size:28px;
											line-height:1.15;
											letter-spacing:-0.8px;
											color:#17200f;
										"
									>
										You have a new enquiry.
									</h1>

									<p
										style="
											margin:0;
											font-size:15px;
											line-height:1.7;
											color:#17200f;
											opacity:0.62;
										"
									>
										Someone has reached out through the Gidi Tour website.
										Here are the details of their enquiry.
									</p>
								</td>
							</tr>

							<!-- CUSTOMER DETAILS -->
							<tr>
								<td style="padding:10px 36px 0;">
									<table
										width="100%"
										cellpadding="0"
										cellspacing="0"
										border="0"
										style="
											background:#f7f3ea;
											border-radius:18px;
											overflow:hidden;
										"
									>
										<tr>
											<td style="padding:22px 24px;">

												<div
													style="
														font-size:10px;
														font-weight:700;
														letter-spacing:1.5px;
														text-transform:uppercase;
														color:#5C9B19;
														margin-bottom:16px;
													"
												>
													Guest details
												</div>

												<table
													width="100%"
													cellpadding="0"
													cellspacing="0"
													border="0"
												>
													<tr>
														<td
															style="
																padding:0 0 14px;
																font-size:12px;
																color:#17200f;
																opacity:0.5;
																width:90px;
															"
														>
															Name
														</td>

														<td
															style="
																padding:0 0 14px;
																font-size:14px;
																font-weight:600;
																color:#17200f;
															"
														>
															${escapeHtml(name!)}
														</td>
													</tr>

													<tr>
														<td
															style="
																padding:0 0 14px;
																font-size:12px;
																color:#17200f;
																opacity:0.5;
															"
														>
															Email
														</td>

														<td
															style="
																padding:0 0 14px;
																font-size:14px;
																font-weight:600;
															"
														>
															<a
																href="mailto:${escapeHtml(email!)}"
																style="
																	color:#5C9B19;
																	text-decoration:none;
																"
															>
																${escapeHtml(email!)}
															</a>
														</td>
													</tr>

													${
														phone
															? `
														<tr>
															<td
																style="
																	padding:0 0 14px;
																	font-size:12px;
																	color:#17200f;
																	opacity:0.5;
																"
															>
																Phone
															</td>

															<td
																style="
																	padding:0 0 14px;
																	font-size:14px;
																	font-weight:600;
																	color:#17200f;
																"
															>
																${escapeHtml(phone)}
															</td>
														</tr>
													`
															: ''
													}

													${
														interest
															? `
														<tr>
															<td
																style="
																	font-size:12px;
																	color:#17200f;
																	opacity:0.5;
																"
															>
																Reason
															</td>

															<td
																style="
																	font-size:14px;
																	font-weight:600;
																	color:#17200f;
																"
															>
																${escapeHtml(interest)}
															</td>
														</tr>
													`
															: ''
													}
												</table>

											</td>
										</tr>
									</table>
								</td>
							</tr>

							<!-- MESSAGE -->
							<tr>
								<td style="padding:28px 36px 10px;">

									<div
										style="
											font-size:10px;
											font-weight:700;
											letter-spacing:1.5px;
											text-transform:uppercase;
											color:#F98315;
											margin-bottom:12px;
										"
									>
										Message
									</div>

									<table
										width="100%"
										cellpadding="0"
										cellspacing="0"
										border="0"
										style="
											border-left:3px solid #F98315;
											background:#fafafa;
											border-radius:0 14px 14px 0;
										"
									>
										<tr>
											<td
												style="
													padding:18px 20px;
													font-size:15px;
													line-height:1.75;
													color:#17200f;
												"
											>
												${escapeHtml(message!).replace(/\n/g, '<br />')}
											</td>
										</tr>
									</table>

								</td>
							</tr>

							<!-- REPLY CTA -->
							<tr>
								<td style="padding:28px 36px 36px;">

									<table
										width="100%"
										cellpadding="0"
										cellspacing="0"
										border="0"
									>
										<tr>
											<td
												style="
													background:#5C9B19;
													border-radius:16px;
													padding:20px 22px;
												"
											>
												<div
													style="
														font-size:14px;
														font-weight:700;
														color:#ffffff;
													"
												>
													Ready to respond?
												</div>

												<div
													style="
														margin-top:5px;
														font-size:12px;
														line-height:1.5;
														color:rgba(255,255,255,0.75);
													"
												>
													Simply reply to this email to continue the conversation with ${escapeHtml(name!)}.
												</div>
											</td>
										</tr>
									</table>

								</td>
							</tr>

							<!-- FOOTER -->
							<tr>
								<td
									style="
										border-top:1px solid #eeeeea;
										padding:22px 36px;
										text-align:center;
									"
								>
									<div
										style="
											font-size:13px;
											font-weight:700;
											color:#17200f;
										"
									>
										Gidi<span style="color:#F98315;">Tour</span>
									</div>

									<div
										style="
											margin-top:6px;
											font-size:11px;
											line-height:1.6;
											color:#17200f;
											opacity:0.45;
										"
									>
										Making travel feel a little more like home.
									</div>
								</td>
							</tr>

						</table>

					</td>
				</tr>
			</table>
		</body>
		</html>
	`
			})
		});

		if (!res.ok) {
			const errBody = await res.text();
			console.error('Resend error:', errBody);
			return json(
				{ error: 'Could not send your message right now. Please try again shortly.' },
				{ status: 502 }
			);
		}

		return json({ success: true });
	} catch (err) {
		console.error('Contact form send failed:', err);
		return json({ error: 'Network error while sending. Please try again.' }, { status: 500 });
	}
};

// minimal HTML-escaping so submitted text can't break the email markup
function escapeHtml(str: string) {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
