<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { FileText, CreditCard, UserCheck, AlertCircle, ChevronRight } from 'lucide-svelte';

	const lastUpdated = '21 September 2026';
</script>

<svelte:head>
	<title>Terms & Conditions - Gidi Tour</title>
	<meta
		name="description"
		content="Read the Terms and Conditions governing bookings and use of Gidi Tour services."
	/>
	<link rel="canonical" href="https://giditour.com/terms" />
</svelte:head>

<div class="min-h-screen bg-[#f7f3ea] text-[#17200f] pb-10">
	<section class="px-5 pb-16 pt-24 sm:px-8 lg:px-12 lg:pb-20 lg:pt-32">
		<div class="mx-auto max-w-300 flex flex-col items-center text-center" use:reveal>
			<a
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				href="/"
				class="mb-8 inline-flex items-center gap-1 text-sm font-bold text-[#5C9B19] hover:text-[#F98315]"
			>
				Home
				<ChevronRight class="h-4 w-4" />
				Terms & Conditions
			</a>

			<div class="max-w-3xl">
				<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-[.14em] text-[#5C9B19] shadow-sm">
					Before you book
				</span>

				<h1 class="mt-5 text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl lg:text-7xl">
					Terms &<br />
					<span class="text-[#F98315]">Conditions.</span>
				</h1>

				<p class="mt-6 max-w-2xl text-base leading-7 text-[#17200f]/65 sm:text-lg">
					These terms explain the rules that apply when you use the Gidi Tour website or book one
					of our experiences.
				</p>

				<p class="mt-5 text-sm font-medium text-[#17200f]/50">
					Last updated: {lastUpdated}
				</p>
			</div>
		</div>
	</section>

	<section class="bg-white px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-250" use:reveal>
			<div class="grid gap-5 md:grid-cols-3">
				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<FileText class="h-7 w-7 text-[#5C9B19]" />
					<h3 class="mt-5 font-bold">Clear terms</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						The important things to know before making a booking.
					</p>
				</div>

				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<CreditCard class="h-7 w-7 text-[#F98315]" />
					<h3 class="mt-5 font-bold">Payments</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						How booking payments, prices and changes are handled.
					</p>
				</div>

				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<UserCheck class="h-7 w-7 text-[#17200f]" />
					<h3 class="mt-5 font-bold">Your responsibility</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						What we expect from guests before and during an experience.
					</p>
				</div>
			</div>

			<article class="mt-16 max-w-3xl space-y-12">
				<section>
					<h2 class="text-2xl font-bold">1. About Gidi Tour</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Gidi Tour Ltd provides travel experiences, tours and related travel services across
						selected destinations. When you make a booking with us, you agree to these Terms &
						Conditions together with any specific terms shown for your chosen experience.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">2. Making a booking</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						A booking request is subject to availability. Your booking becomes confirmed when we
						accept it and, where applicable, receive the required payment. Your confirmation will
						contain the important details of your experience.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						You are responsible for checking the booking information, including dates, times,
						traveler details, meeting or pickup arrangements and any special requirements.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">3. Prices and payment</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Prices are shown on the relevant booking or experience page. The price applicable to
						your booking is the price confirmed at the time of booking, unless an obvious pricing
						error has occurred.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Payment may be processed through third-party payment providers. We do not normally
						receive or store your full payment-card details.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">4. Changes to an experience</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Travel conditions, weather, local events, transport issues, venue availability or other
						circumstances may occasionally require us to change part of an itinerary. Where a change
						is necessary, we will make reasonable efforts to provide an appropriate alternative or
						communicate the available options.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">5. Guest responsibilities</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Guests must provide accurate information and arrive at the agreed meeting or pickup
						location on time. Guests are expected to follow reasonable instructions from guides and
						behave respectfully towards other guests, staff, local communities and property.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						You are responsible for ensuring that you have any documents, visas, permissions,
						insurance or other requirements needed for your journey.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">6. Health, accessibility and special requirements</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Please tell us about relevant accessibility requirements, dietary requirements, mobility
						limitations or other needs before booking where possible. Not every experience is suitable
						for every guest, and certain activities may have specific requirements.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">7. Travel insurance</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We recommend that travelers consider appropriate travel insurance for their
						circumstances, including cover for cancellation, medical expenses, baggage and other
						relevant risks.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">8. Cancellation and refunds</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Cancellation and refund arrangements depend on the experience and booking terms that
						apply to your reservation. Please review our
						<a href="/cancellation-refund" class="font-bold text-[#5C9B19] hover:text-[#F98315]">
							Cancellation & Refund Policy
						</a>
						before booking.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">9. Liability</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Nothing in these terms excludes or limits liability where doing so would be unlawful.
						Subject to applicable law, we are not responsible for losses that could not reasonably
						have been anticipated or for matters outside our reasonable control.
					</p>
				</section>

				<section>
					<div class="flex gap-4 rounded-[26px] bg-[#fff7ef] p-7">
						<AlertCircle class="mt-1 h-6 w-6 shrink-0 text-[#F98315]" />
						<div>
							<h2 class="text-xl font-bold">Important</h2>
							<p class="mt-3 leading-7 text-[#17200f]/65">
								Specific experiences may have additional conditions relating to age, group size,
								activity requirements, pickup arrangements or cancellation deadlines. Those
								conditions form part of your booking where applicable.
							</p>
						</div>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold">10. Website use</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						You must not misuse our website, attempt to gain unauthorized access, interfere with its
						operation or use it for fraudulent or unlawful purposes.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">11. Changes to these terms</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						We may update these terms when our services or legal requirements change. The version
						applicable to your booking will be the version provided or made available when you book,
						subject to any changes required by law.
					</p>
				</section>

				<section class="rounded-[28px] bg-[#f7f3ea] p-7 sm:p-9">
					<h2 class="text-2xl font-bold">Contact Gidi Tour</h2>
					<p class="mt-3 leading-7 text-[#17200f]/65">
						Gidi Tour Ltd<br />
						95 Fenham Road<br />
						London SE15 1AE<br />
						England
					</p>
					<a
						href="mailto:support@giditour.com"
						class="mt-4 inline-block text-sm font-bold text-[#5C9B19] hover:text-[#F98315]"
					>
						support@giditour.com
					</a>
				</section>
			</article>
		</div>
	</section>
</div>