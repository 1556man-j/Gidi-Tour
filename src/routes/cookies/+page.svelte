<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { Cookie, Settings2, BarChart3, ShieldCheck, ChevronRight } from 'lucide-svelte';
	const lastUpdated = '21 September 2026';
</script>

<svelte:head>
	<title>Cookie Policy - Gidi Tour</title>
	<meta
		name="description"
		content="Learn how Gidi Tour uses cookies and similar technologies on our website."
	/>
	<link rel="canonical" href="https://giditour.com/cookies" />
</svelte:head>

<div class="min-h-screen bg-[#f7f3ea] text-[#17200f] pb-10">
	<section class="relative overflow-hidden px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pb-20 lg:pt-32">
		<div class="relative mx-auto max-w-300 flex flex-col text-center items-center" use:reveal>
			<a
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				href="/"
				class="mb-8 inline-flex items-center gap-1 text-sm font-bold text-[#5C9B19] hover:text-[#F98315]"
			>
				Home
				<ChevronRight class="h-4 w-4" />
				Cookie Policy
			</a>

			<div class="max-w-3xl">
				<span
					class="inline-flex rounded-full bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-[.14em] text-[#F98315] shadow-sm"
				>
					Simple & transparent
				</span>

				<h1 class="mt-5 text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl lg:text-7xl">
					Cookies<br />
					<span class="text-[#5C9B19]">explained.</span>
				</h1>

				<p class="mt-6 max-w-2xl text-base leading-7 text-[#17200f]/65 sm:text-lg">
					Cookies help our website work properly and help us understand how people use it. Here is
					what they are, what we use them for and what choices you have.
				</p>

				<p class="mt-5 text-sm font-medium text-[#17200f]/50">
					Last updated: {lastUpdated}
				</p>
			</div>
		</div>
	</section>

	<section class="bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-250" use:reveal>
			<div class="grid gap-5 sm:grid-cols-3">
				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<Cookie class="h-7 w-7 text-[#F98315]" />
					<h3 class="mt-5 text-lg font-bold">Necessary</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						Help the website function and provide services you request.
					</p>
				</div>

				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<BarChart3 class="h-7 w-7 text-[#5C9B19]" />
					<h3 class="mt-5 text-lg font-bold">Analytics</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						Help us understand website usage and improve the experience.
					</p>
				</div>

				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<Settings2 class="h-7 w-7 text-[#17200f]" />
					<h3 class="mt-5 text-lg font-bold">Your choices</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						Where required, you can choose whether optional cookies are used.
					</p>
				</div>
			</div>

			<article class="mt-16 max-w-3xl space-y-12">
				<section>
					<h2 class="text-2xl font-bold">1. What are cookies?</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Cookies are small text files placed on your device when you visit a website. They allow
						a website to remember information about your visit and can make websites work more
						efficiently.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">2. How Gidi Tour uses cookies</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We may use cookies and similar technologies to keep our website secure, remember
						preferences, support booking functionality, understand how visitors interact with our
						website and improve our services.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">3. Types of cookies</h2>

					<div class="mt-6 overflow-hidden rounded-3xl border border-black/10">
						<div
							class="grid grid-cols-[1fr_2fr] bg-[#17200f] px-5 py-4 text-xs font-bold uppercase tracking-widest text-white"
						>
							<span>Type</span>
							<span>Purpose</span>
						</div>

						<div class="grid grid-cols-[1fr_2fr] border-t border-black/10 px-5 py-5">
							<span class="text-sm font-bold">Necessary</span>
							<span class="text-sm leading-6 text-[#17200f]/60">
								Support core website features, security, navigation and services you request.
							</span>
						</div>

						<div class="grid grid-cols-[1fr_2fr] border-t border-black/10 px-5 py-5">
							<span class="text-sm font-bold">Preferences</span>
							<span class="text-sm leading-6 text-[#17200f]/60">
								Remember choices and settings where these features are enabled.
							</span>
						</div>

						<div class="grid grid-cols-[1fr_2fr] border-t border-black/10 px-5 py-5">
							<span class="text-sm font-bold">Analytics</span>
							<span class="text-sm leading-6 text-[#17200f]/60">
								Help us understand website traffic and how visitors use our pages.
							</span>
						</div>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold">4. Third-party cookies</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Some services integrated into our website may set their own cookies or similar
						technologies. These may include analytics, payment, booking or other technology
						providers. Their use of information is governed by their own privacy policies.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">5. Managing cookies</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						You can manage cookies through your browser settings. Depending on your location, we may
						also provide a cookie preference mechanism on the website for optional cookies.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Blocking necessary cookies may affect how parts of the website work.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">6. Changes to this policy</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We may update this Cookie Policy when our technology, services or legal requirements
						change. Any updated version will appear on this page.
					</p>
				</section>

				<section class="rounded-[28px] bg-[#f7f3ea] p-7 sm:p-9">
					<div class="flex gap-4">
						<div
							class="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#5C9B19]/10 text-[#5C9B19]"
						>
							<ShieldCheck class="h-5 w-5" />
						</div>
						<div>
							<h2 class="text-2xl font-bold">Questions?</h2>
							<p class="mt-3 leading-7 text-[#17200f]/65">
								If you have questions about how Gidi Tour uses cookies, contact us at
								<a
									href="mailto:support@giditour.com"
									class="font-bold text-[#5C9B19] hover:text-[#F98315]"
								>
									support@giditour.com
								</a>.
							</p>
						</div>
					</div>
				</section>
			</article>
		</div>
	</section>
</div>
