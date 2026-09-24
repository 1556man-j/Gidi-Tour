<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { CalendarX2, RefreshCcw, WalletCards, Info, ChevronRight } from 'lucide-svelte';

	const lastUpdated = '21 September 2026';
</script>

<svelte:head>
	<title>Cancellation & Refund Policy | Gidi Tour</title>
	<meta
		name="description"
		content="Read Gidi Tour's cancellation and refund policy before booking your travel experience."
	/>
	<link rel="canonical" href="https://giditour.com/cancellation-refund" />
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
				Cancellation & Refund
			</a>

			<div class="max-w-3xl">
				<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[12px] font-bold uppercase tracking-[.14em] text-[#F98315] shadow-sm">
					Before you travel
				</span>

				<h1 class="mt-5 text-5xl font-bold leading-[.95] tracking-[-.04em] sm:text-6xl lg:text-7xl">
					Cancellation<br />
					<span class="text-[#5C9B19]">& refunds.</span>
				</h1>

				<p class="mt-6 max-w-2xl text-base leading-7 text-[#17200f]/65 sm:text-lg">
					Plans can change. This policy explains what happens when you need to cancel a booking or
					when Gidi Tour has to make a change to your experience.
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
					<CalendarX2 class="h-7 w-7 text-[#F98315]" />
					<h3 class="mt-5 font-bold">You need to cancel</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						Contact us as soon as possible so we can review your booking terms.
					</p>
				</div>

				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<RefreshCcw class="h-7 w-7 text-[#5C9B19]" />
					<h3 class="mt-5 font-bold">We need to change</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						We will communicate important changes and available options.
					</p>
				</div>

				<div class="rounded-3xl bg-[#f7f3ea] p-6">
					<WalletCards class="h-7 w-7 text-[#17200f]" />
					<h3 class="mt-5 font-bold">Refunds</h3>
					<p class="mt-2 text-sm leading-6 text-[#17200f]/60">
						Where a refund is due, we will process it through the applicable payment method.
					</p>
				</div>
			</div>

			<article class="mt-16 max-w-3xl space-y-12">
				<section>
					<h2 class="text-2xl font-bold">1. Cancellation by you</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						If you need to cancel a booking, please contact Gidi Tour as soon as possible using the
						contact details below. Cancellation charges, if any, depend on the experience, supplier
						conditions and the time between your cancellation and the scheduled start of the
						experience.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Where a specific experience page or booking confirmation gives a different cancellation
						deadline or refund arrangement, that specific condition will apply to the booking.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">2. Refund eligibility</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Where you are entitled to a refund, the amount will depend on the applicable booking
						conditions and the reason for cancellation. Some bookings may be refundable up to a
						specified deadline, while others may have cancellation charges or be non-refundable where
						legally permitted.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">3. No-show or late arrival</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						If you do not attend an experience or arrive too late to participate, this may be treated
						as a cancellation by you. Any refund will depend on the applicable booking conditions and
						whether the experience provider can reasonably accommodate the change.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">4. Cancellation by Gidi Tour</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						In some circumstances, we may need to cancel an experience. This could happen because of
						safety concerns, severe weather, operational issues, supplier problems or circumstances
						outside our reasonable control.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Where we cancel, we will communicate the available options. Depending on the booking and
						the circumstances, this may include an alternative date, an alternative experience or a
						refund where one is due.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">5. Changes to your experience</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Minor itinerary changes may sometimes be necessary because of local conditions,
						availability, opening hours, transport or other practical considerations. We will make
						reasonable efforts to keep the experience aligned with its advertised character.
					</p>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						If a significant change affects your booking, we will provide information about the
						available options where required.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">6. How refunds are processed</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Approved refunds are normally returned using the original payment method where
						practicable. Processing times can vary depending on the payment provider, bank or card
						issuer.
					</p>
				</section>

				<section>
					<div class="rounded-[28px] bg-[#fff7ef] p-7  sm:p-9">
						<div class="flex gap-4">
							<Info class="mt-1 h-6 w-6 shrink-0 text-[#F98315]" />
							<div>
								<h2 class="text-xl font-bold">Before you cancel</h2>
								<p class="mt-3 leading-7 text-[#17200f]/65">
									Check your booking confirmation first. It may contain a specific cancellation
									deadline, fee or refund arrangement for your experience.
								</p>
							</div>
						</div>
					</div>
				</section>

				<section>
					<h2 class="text-2xl font-bold">7. Special circumstances</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						If circumstances outside your control affect your ability to travel, contact us as soon as
						possible. We will review the circumstances and your booking conditions and explain what
						options may be available.
					</p>
				</section>

				<section>
					<h2 class="text-2xl font-bold">8. Package travel and legal rights</h2>
					<p class="mt-4 leading-7 text-[#17200f]/65">
						Where a booking constitutes a package or otherwise falls within mandatory consumer
						protection legislation, your statutory rights apply in addition to these terms. Nothing in
						this policy is intended to remove or restrict rights that cannot lawfully be excluded.
					</p>
				</section>

				<section class="rounded-[28px] bg-[#f7f3ea] p-7 sm:p-9">
					<h2 class="text-2xl font-bold">Need help with a cancellation?</h2>
					<p class="mt-3 leading-7 text-[#17200f]/65">
						Contact Gidi Tour with your booking details and we will review the applicable conditions.
					</p>

					<div class="mt-5 text-sm font-medium leading-6 text-[#17200f]">
						Gidi Tour Ltd<br />
						95 Fenham Road<br />
						London SE15 1AE<br />
						England
					</div>

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