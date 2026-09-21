<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { ShieldCheck, Database, Mail, ChevronRight } from 'lucide-svelte';

	const lastUpdated = '21 September 2026';
</script>

/* eslint-disable svelte/no-navigation-without-resolve */

<svelte:head>
	<title>Privacy Policy - Gidi Tour</title>
	<meta
		name="description"
		content="Read Gidi Tour's Privacy Policy to understand how we collect, use, store and protect your personal information."
	/>
	<link rel="canonical" href="https://giditour.com/privacy" />
</svelte:head>

<div class="min-h-screen bg-[#f7f3ea] text-[#17200f] pb-10">
	<section class="relative overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pb-20 lg:pt-32">
		<div class="relative mx-auto max-w-300 items-center flex flex-col text-center" use:reveal>
			<a
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				href="/"
				class="mb-8 inline-flex items-center gap-1 text-sm font-bold text-[#5C9B19] transition hover:text-[#F98315]"
			>
				Home
				<ChevronRight class="h-4 w-4" />
				Privacy Policy
			</a>

			<div class="max-w-3xl">
				<span
					class="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-[.14em] text-[#5C9B19] shadow-sm"
				>
					Your privacy matters
				</span>

				<h1 class="mt-5 text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl lg:text-7xl">
					Privacy<br />
					<span class="text-[#F98315]">Policy.</span>
				</h1>

				<p class="mt-6 max-w-2xl text-base leading-7 text-[#17200f]/65 sm:text-lg">
					We want you to feel comfortable exploring with Gidi Tour. This policy explains what
					information we collect, why we collect it and how we use it when you visit or use our
					website and services.
				</p>

				<p class="mt-5 text-sm font-medium text-[#17200f]/50">
					Last updated: {lastUpdated}
				</p>
			</div>
		</div>
	</section>

	<section class="bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto grid max-w-300 gap-12 lg:grid-cols-[280px_1fr]">
			<aside class="lg:sticky lg:top-28 lg:h-fit" use:reveal>
				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<p class="text-[14px] font-bold uppercase tracking-widest text-[#F98315]">
						On this page
					</p>

					<nav class="mt-4 space-y-2">
						<a href="#information" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>Information we collect</a
						>
						<a href="#use" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>How we use it</a
						>
						<a href="#sharing" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>Who we share it with</a
						>
						<a href="#cookies" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>Cookies & analytics</a
						>
						<a href="#retention" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>How long we keep it</a
						>
						<a href="#rights" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>Your rights</a
						>
						<a href="#contact" class="block text-base text-[#17200f]/65 hover:text-[#5C9B19]"
							>Contact us</a
						>
					</nav>
				</div>

				<div class="mt-5 rounded-3xl bg-[#fff7ef] p-6 ">
					<ShieldCheck class="h-7 w-7 text-[#F98315]" />
					<p class="mt-4 text-base font-bold">Your information is handled responsibly.</p>
					<p class="mt-2 text-xs leading-5 text-[#17200f]/65">
						We only collect information that helps us provide, improve and protect our services.
					</p>
				</div>
			</aside>

			<article class="max-w-3xl space-y-12" use:reveal>
				<section id="information">
					<div class="flex items-start gap-4">
						<div
							class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#5C9B19]/10 text-[#5C9B19]"
						>
							<Database class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-2xl font-bold">1. Information we collect</h2>
							<p class="mt-4 leading-7 text-[#17200f]/65">
								Depending on how you use Gidi Tour, we may collect information such as your name,
								email address, phone number, billing or booking details, travel preferences and
								other information you choose to provide.
							</p>
							<p class="mt-4 leading-7 text-[#17200f]/65">
								When you browse our website, we may also receive technical information such as your
								IP address, browser type, device information, pages visited and approximate usage
								information. Some of this information may be collected through cookies and similar
								technologies.
							</p>
						</div>
					</div>
				</section>

				<section id="use">
					<h2 class="text-2xl font-bold">2. How we use your information</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We use personal information where necessary to provide the services you request and to
						operate Gidi Tour. This may include processing bookings and payments, communicating with
						you about your trip, responding to enquiries, providing customer support and sending
						service-related updates.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Where permitted by law, we may also use information to understand how visitors use our
						website, improve our experiences, prevent fraud or misuse, maintain website security and
						develop our products and services.
					</p>
				</section>

				<section id="sharing">
					<h2 class="text-2xl font-bold">3. Who we share information with</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We do not sell your personal information. We may share relevant information with trusted
						service providers where this is necessary to operate Gidi Tour, such as payment
						processors, booking and technology providers, email providers, accommodation or activity
						partners and professional advisers.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We only share information that is reasonably necessary for the relevant service or
						purpose. Some providers may process information outside the UK or your country of
						residence. Where applicable, we take appropriate steps to ensure personal information is
						handled in accordance with applicable data protection requirements.
					</p>
				</section>

				<section id="cookies">
					<h2 class="text-2xl font-bold">4. Cookies & analytics</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Our website may use cookies and similar technologies to make the website work, remember
						preferences, understand website usage and improve your experience.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Some cookies are necessary for the website to function. Other cookies, such as certain
						analytics or marketing cookies, may require your consent depending on their purpose and
						the applicable law. You can learn more about the cookies we use on our
						<a href="/cookies" class="font-bold text-[#5C9B19] hover:text-[#F98315]"
							>Cookie Policy</a
						>.
					</p>
				</section>

				<section id="retention">
					<h2 class="text-2xl font-bold">5. How long we keep your information</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We keep personal information only for as long as reasonably necessary for the purpose
						for which it was collected, including to provide our services, maintain appropriate
						business and financial records, resolve disputes, enforce agreements and comply with
						legal obligations.
					</p>
				</section>

				<section id="rights">
					<h2 class="text-2xl font-bold">6. Your rights</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Depending on your location and applicable law, you may have rights relating to your
						personal information, including the right to request access, correction, deletion or
						restriction of processing, and in certain circumstances the right to object to
						processing or request data portability.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						You can also withdraw consent where processing is based on consent. Withdrawing consent
						does not affect processing that took place before withdrawal.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">7. Children</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Our website and services are not intended to knowingly collect personal information from
						children without appropriate involvement or permission from a parent or guardian where
						required by law.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">8. Changes to this policy</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We may update this Privacy Policy from time to time to reflect changes to our services,
						technology or legal requirements. The updated version will be posted on this page with a
						revised “Last updated” date.
					</p>
				</section>

				<section id="contact" class="rounded-[28px] bg-[#f7f3ea] p-7 sm:p-9">
					<div class="flex items-start gap-4">
						<div
							class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#F98315]/10 text-[#F98315]"
						>
							<Mail class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-2xl font-bold">9. Contact us</h2>
							<p class="mt-3 leading-7 text-[#17200f]/65">
								If you have a question about this Privacy Policy or how we handle your information,
								please contact Gidi Tour Ltd.
							</p>
							<p class="mt-4 text-sm font-bold text-[#17200f]">
								Gidi Tour Ltd<br />
								9 Norman Rd<br />
								London SE10 9QZ<br />
								United Kingdom
							</p>
							<a
								href="mailto:support@giditour.com"
								class="mt-4 inline-flex text-sm font-bold text-[#5C9B19] hover:text-[#F98315]"
							>
								support@giditour.com
							</a>
						</div>
					</div>
				</section>
			</article>
		</div>
	</section>
</div>
