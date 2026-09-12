<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { ArrowRight } from 'lucide-svelte';
	import SeoHead from '../../components/SeoHead.svelte';
	import type { PageData } from './$types';

	type SocialLinks = {
		instagram?: string;
		twitter?: string;
		youtube?: string;
		tiktok?: string;
	};

	interface Props {
		data: PageData;
		socialLinks?: SocialLinks;
	}

	let { data, socialLinks }: Props = $props();

	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	const fallbackSocials: SocialLinks = {
		instagram: 'https://www.instagram.com/gidi_tour?stkn=dHpkbGhoMDB1eWpi',
		twitter: 'https://x.com/gidi_tour?s=11',
		// tiktok: 'https://www.tiktok.com/@gidi_tour?_r=1&_t=ZS-99dwaBlufVV',
		youtube: 'https://youtube.com/@gidi_tour?si=CSeBJcpEIIVmEHb3'
	};

	const socials = $derived(socialLinks ?? fallbackSocials);

	const interestOptions = [
		'Trip enquiry',
		'Group / custom tour',
		'Partnership',
		'Press',
		'General'
	];

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let interest = $state('');
	let message = $state('');

	let loading = $state(false);
	let success = $state(false);
	let formError = $state(''); // general/top-level error
	let fieldErrors = $state<Record<string, string>>({}); // per-field errors

	function validateClientSide() {
		const errs: Record<string, string> = {};
		if (!name.trim() || name.trim().length < 2) {
			errs.name = 'Please enter your full name.';
		}
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			errs.email = 'Please enter a valid email address.';
		}
		if (!message.trim() || message.trim().length < 10) {
			errs.message = 'Message should be at least 10 characters.';
		}
		if (phone.trim() && !/^[+\d][\d\s().-]{6,20}$/.test(phone.trim())) {
			errs.phone =
				'Please enter a valid phone number, with country code if outside your home country.';
		}
		return errs;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		formError = '';

		const clientErrors = validateClientSide();
		if (Object.keys(clientErrors).length > 0) {
			fieldErrors = clientErrors;
			return;
		}
		fieldErrors = {};

		loading = true;
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, phone, interest, message })
			});

			const data = await res.json();

			if (!res.ok) {
				fieldErrors = data.fieldErrors ?? {};
				formError = data.error ?? 'Something went wrong. Please try again.';
			} else {
				success = true;
			}
		} catch {
			formError = 'Network error. Please check your connection and try again.';
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		name = '';
		email = '';
		phone = '';
		interest = '';
		message = '';
		fieldErrors = {};
		formError = '';
		success = false;
	}
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/contact"
	siteName={data.siteSettings?.siteName}
/>

<!-- HERO -->
<section
	class="relative overflow-hidden bg-[#f7f3ea] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-32"
	use:reveal
>
	<div
		class="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#5C9B19]/6 blur-3xl"
	></div>
	<div
		class="pointer-events-none absolute -bottom-40 -left-32 h-80 w-80 rounded-full bg-[#F98315]/5 blur-3xl"
	></div>

	<div class="relative mx-auto max-w-3xl text-center">
		<span
			class="inline-flex items-center rounded-full border border-[#5C9B19]/15 bg-white/80 px-4 py-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#5C9B19] shadow-sm backdrop-blur"
		>
			Contact Us
		</span>

		<h1
			class="mt-6 flex flex-col text-4xl font-bold leading-[0.98] tracking-[-0.04em] text-[#17200f] sm:text-5xl lg:text-7xl"
		>
			Let's plan
			<span class="text-[#F98315]">your next trip.</span>
		</h1>

		<p
			class="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#17200f]/80 sm:text-[20px] sm:leading-8"
		>
			Questions about a destination, a custom itinerary, a group trip, or just want to say hello?
			Send us a message and someone from the team will get back to you.
		</p>
	</div>
</section>

<!-- FORM + CONTACT INFO -->
<section class="bg-[#f7f3ea] px-5 pb-20 sm:px-8 sm:pb-24 lg:px-12 lg:pb-32" use:reveal>
	<div class="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:gap-8">
		<!-- FORM CARD -->
		<div
			class="rounded-[28px] bg-white p-6 shadow-[0_12px_45px_rgba(23,32,15,0.06)] sm:rounded-4xl sm:p-8 lg:p-10"
		>
			{#if success}
				<div class="flex min-h-120 flex-col items-center justify-center py-12 text-center">
					<div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#5C9B19]/10">
						<svg
							class="h-7 w-7 text-[#5C9B19]"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<polyline points="20 6 9 17 4 12" />
						</svg>
					</div>

					<h2 class="font-display mt-6 text-3xl font-bold tracking-[-0.03em] text-[#17200f]">
						Message sent!
					</h2>

					<p class="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#17200f]/55">
						Thanks for reaching out. Someone from the team will get back to you within one business
						day.
					</p>

					<button
						type="button"
						onclick={resetForm}
						class="mt-7 rounded-full border border-[#17200f]/10 px-5 py-2.5 text-sm font-semibold text-[#17200f] transition hover:border-[#5C9B19] hover:text-[#5C9B19]"
					>
						Send another message
					</button>
				</div>
			{:else}
				<div class="mb-8">
					<p class="text-[12px] font-bold uppercase tracking-[0.1em] text-[#F98315]">
						Send us a message
					</p>
					<h2
						class="font-display mt-2 text-3xl font-bold tracking-[-0.035em] text-[#17200f] sm:text-4xl"
					>
						How can we help?
					</h2>
					<p class="mt-3 max-w-lg text-sm leading-6 text-[#17200f]/75">
						Tell us a little about what you're looking for and we'll point you in the right
						direction.
					</p>
				</div>

				<form onsubmit={handleSubmit} novalidate class="space-y-5">
					<!-- Name + Email -->
					<div class="grid gap-5 sm:grid-cols-2">
						<div class="space-y-2">
							<label for="contact-name" class="block text-xs font-semibold text-[#17200f]/70"
								>Name</label
							>
							<input
								id="contact-name"
								type="text"
								placeholder="Adaeze Okafor"
								bind:value={name}
								required
								autocomplete="name"
								aria-invalid={Boolean(fieldErrors.name)}
								aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
								class="h-14 w-full rounded-2xl border bg-[#fafafa] px-4 text-sm text-[#17200f] outline-none transition placeholder:text-[#17200f]/30 focus:bg-white focus:ring-4 {fieldErrors.name
									? 'border-[#F98315] focus:border-[#F98315] focus:ring-[#F98315]/10'
									: 'border-black/10 hover:border-black/20 focus:border-[#5C9B19] focus:ring-[#5C9B19]/10'}"
							/>
							{#if fieldErrors.name}
								<p id="contact-name-error" class="text-xs font-medium text-[#F98315]" role="alert">
									{fieldErrors.name}
								</p>
							{/if}
						</div>

						<div class="space-y-2">
							<label for="contact-email" class="block text-xs font-semibold text-[#17200f]/70"
								>Email</label
							>
							<input
								id="contact-email"
								type="email"
								placeholder="you@example.com"
								bind:value={email}
								required
								autocomplete="email"
								aria-invalid={Boolean(fieldErrors.email)}
								aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
								class="h-14 w-full rounded-2xl border bg-[#fafafa] px-4 text-sm text-[#17200f] outline-none transition placeholder:text-[#17200f]/30 focus:bg-white focus:ring-4 {fieldErrors.email
									? 'border-[#F98315] focus:border-[#F98315] focus:ring-[#F98315]/10'
									: 'border-black/10 hover:border-black/20 focus:border-[#5C9B19] focus:ring-[#5C9B19]/10'}"
							/>
							{#if fieldErrors.email}
								<p id="contact-email-error" class="text-xs font-medium text-[#F98315]" role="alert">
									{fieldErrors.email}
								</p>
							{/if}
						</div>
					</div>

					<!-- Phone + Reason -->
					<div class="grid gap-5 sm:grid-cols-2">
						<div class="space-y-2">
							<label for="contact-phone" class="block text-xs font-semibold text-[#17200f]/70">
								Phone <span class="font-normal text-[#17200f]/35">(optional)</span>
							</label>
							<input
								id="contact-phone"
								type="tel"
								placeholder="+1 415 555 0132"
								bind:value={phone}
								autocomplete="tel"
								aria-invalid={Boolean(fieldErrors.phone)}
								aria-describedby={fieldErrors.phone ? 'contact-phone-error' : undefined}
								class="h-14 w-full rounded-2xl border bg-[#fafafa] px-4 text-sm text-[#17200f] outline-none transition placeholder:text-[#17200f]/30 focus:bg-white focus:ring-4 {fieldErrors.phone
									? 'border-[#F98315] focus:border-[#F98315] focus:ring-[#F98315]/10'
									: 'border-black/10 hover:border-black/20 focus:border-[#5C9B19] focus:ring-[#5C9B19]/10'}"
							/>
							{#if fieldErrors.phone}
								<p id="contact-phone-error" class="text-xs font-medium text-[#F98315]" role="alert">
									{fieldErrors.phone}
								</p>
							{:else}
								<p class="text-xs text-[#17200f]/35">
									Include your country code — works from anywhere.
								</p>
							{/if}
						</div>

						<div class="space-y-2">
							<label for="contact-interest" class="block text-xs font-semibold text-[#17200f]/70">
								Reason <span class="font-normal text-[#17200f]/35">(optional)</span>
							</label>
							<select
								id="contact-interest"
								bind:value={interest}
								class="h-14 w-full cursor-pointer appearance-none rounded-2xl border border-black/10 bg-[#fafafa] px-4 text-sm text-[#17200f] outline-none transition hover:border-black/20 focus:border-[#5C9B19] focus:bg-white focus:ring-4 focus:ring-[#5C9B19]/10"
							>
								<option value="">Select a reason</option>
								{#each interestOptions as option (option)}
									<option value={option}>{option}</option>
								{/each}
							</select>
						</div>
					</div>

					<!-- Message -->
					<div class="space-y-2">
						<label for="contact-message" class="block text-xs font-semibold text-[#17200f]/70"
							>Message</label
						>
						<textarea
							id="contact-message"
							placeholder="Tell us how we can help…"
							bind:value={message}
							rows="6"
							required
							aria-invalid={Boolean(fieldErrors.message)}
							aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
							class="min-h-[150px] w-full resize-y rounded-2xl border bg-[#fafafa] px-4 py-4 text-sm leading-6 text-[#17200f] outline-none transition placeholder:text-[#17200f]/30 focus:bg-white focus:ring-4 {fieldErrors.message
								? 'border-[#F98315] focus:border-[#F98315] focus:ring-[#F98315]/10'
								: 'border-black/10 hover:border-black/20 focus:border-[#5C9B19] focus:ring-[#5C9B19]/10'}"
						></textarea>
						{#if fieldErrors.message}
							<p id="contact-message-error" class="text-xs font-medium text-[#F98315]" role="alert">
								{fieldErrors.message}
							</p>
						{/if}
					</div>

					{#if formError}
						<div
							class="rounded-2xl border border-[#F98315]/20 bg-[#F98315]/5 px-4 py-3 text-sm leading-5 text-[#c65e00]"
							role="alert"
						>
							{formError}
						</div>
					{/if}

					<!-- Submit -->
					<div class="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
						<p class="text-sm leading-5 text-[#17200f]/70">
							We usually respond within one business day.
						</p>

						<button
							type="submit"
							disabled={loading}
							class="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(92,155,25,0.2)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#4f8816] hover:shadow-[0_12px_25px_rgba(92,155,25,0.25)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
						>
							{#if loading}
								<span
									class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
								></span>
								Sending…
							{:else}
								Send Message
								<ArrowRight
									class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
									aria-hidden="true"
								/>
							{/if}
						</button>
					</div>
				</form>
			{/if}
		</div>

		<!-- CONTACT CARD -->
		<div
			class="relative overflow-hidden rounded-[28px] bg-[#17200f] p-6 text-white sm:rounded-[32px] sm:p-8 lg:p-9"
		>
			<div
				class="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#5C9B19]/20 blur-2xl"
			></div>
			<div
				class="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-[#F98315]/10 blur-2xl"
			></div>

			<div class="relative">
				<span
					class="inline-flex rounded-full bg-white/10 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F98315]"
				>
					Stay connected
				</span>

				<h3 class="font-display mt-5 text-2xl font-bold tracking-[-0.03em] sm:text-3xl">
					Prefer to connect elsewhere?
				</h3>

				<p class="mt-4 text-sm leading-6 text-white/55">
					Find us on social. We're usually quick to reply, and it's a great way to see recent trips
					before you book your own.
				</p>

				<div class="mt-7 flex flex-wrap gap-3">
					{#if socials.instagram}
						<a
							href={socials.instagram}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Instagram"
							class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-[#F98315] hover:bg-[#F98315]"
						>
							<svg
								class="h-[19px] w-[19px]"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M12 2.16c3.2 0 3.58 0 4.85.07 1.17.06 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.36 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.06 1.17-.25 1.8-.42 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.17-1.06.36-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.06-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.36-1.06-.42-2.23C2.17 15.58 2.16 15.2 2.16 12s0-3.58.07-4.85c.06-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.36 2.23-.42C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33 0 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05 0 8.33 0 8.74 0 12s0 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 24 8.74 24 12 24s3.67 0 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.07-1.28.07-1.69.07-4.95s0-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67 0 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8ZM19.85 5.6a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"
								/>
							</svg>
						</a>
					{/if}

					{#if socials.twitter}
						<a
							href={socials.twitter}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Twitter / X"
							class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-[#F98315] hover:bg-[#F98315]"
						>
							<svg
								class="h-[18px] w-[18px]"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h8.04l4.71 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
								/>
							</svg>
						</a>
					{/if}

					{#if socials.youtube}
						<a
							href={socials.youtube}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="YouTube"
							class="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition duration-300 hover:-translate-y-1 hover:border-[#F98315] hover:bg-[#F98315]"
						>
							<svg
								class="h-[18px] w-[18px]"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3 3 0 0 0 2.12 2.13C4.5 20.45 12 20.45 12 20.45s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.6 15.6V8.4l6.24 3.6L9.6 15.6Z"
								/>
							</svg>
						</a>
					{/if}
				</div>

				<div class="mt-10 border-t border-white/10 pt-7">
					<p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F98315]">
						Email us directly
					</p>
					<a
						href="mailto:support@giditour.com"
						class="mt-2 inline-flex text-base font-semibold text-white transition hover:text-[#F98315]"
					>
						support@giditour.com
					</a>
				</div>

				<div
					class="mt-8 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3.5"
				>
					<span
						class="h-2 w-2 shrink-0 rounded-full bg-[#5C9B19] shadow-[0_0_0_4px_rgba(92,155,25,0.12)]"
					></span>
					<p class="text-xs leading-5 text-white/50">
						Our team is here to help with your next adventure.
					</p>
				</div>
			</div>
		</div>
	</div>
</section>
