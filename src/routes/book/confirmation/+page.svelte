<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import {
		Check,
		ArrowRight,
		Mail,
		Calendar,
		Users,
		MapPin,
		Clock3,
		ShieldCheck
	} from 'lucide-svelte';
	import { tourStore } from '$lib/stores/tourStore.svelte';
	import SeoHead from '../../../components/SeoHead.svelte';

	let { data } = $props();

	const booking = $derived(data.booking);
	const bookingId = $derived(data.bookingId);

	const destination = $derived(booking?.destination ?? '');
	const name = $derived(booking?.name ?? '');
	const email = $derived(booking?.email ?? '');
	const startDate = $derived(booking?.startDate ?? '');
	const endDate = $derived(booking?.endDate ?? '');
	const travelers = $derived(booking?.travelers ?? 1);
	const paymentStatus = $derived(booking?.paymentStatus ?? 'pending');
	const amountCharged = $derived(booking?.amountCharged ?? null);
	const currency = $derived(booking?.currency ?? '');

	const isPaid = $derived(paymentStatus === 'paid');

	const methodLabel = $derived(
		booking?.paymentMethod === 'dlocal'
			? 'dLocal'
			: booking?.paymentMethod === 'stripe'
				? 'Stripe'
				: 'Secure checkout'
	);

	// Payment providers can return the customer a moment before our webhook
	// marks the booking as paid. Check again a few times instead of leaving
	// them on "pending" forever.
	onMount(() => {
		// If the provider says it worked, the trip list can be cleared now.
		const params = new URLSearchParams(window.location.search);
		if (isPaid || params.get('redirect_status') === 'succeeded') {
			tourStore.clear();
		}

		let tries = 0;
		const timer = setInterval(async () => {
			if (isPaid || tries >= 10) {
				clearInterval(timer);
				return;
			}
			tries += 1;
			await invalidateAll();
		}, 3000);

		return () => clearInterval(timer);
	});

	// Clear the list as soon as the status flips to paid while polling.
	$effect(() => {
		if (isPaid) tourStore.clear();
	});

	function formatDate(date: string) {
		if (!date) return '—';

		const parsed = new Date(date);

		if (Number.isNaN(parsed.getTime())) {
			return date;
		}

		return parsed.toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatAmount(amount: number | null, currencyCode: string) {
		if (amount === null || amount === undefined) return null;

		// Your Sanity/payment amounts are stored in the smallest currency unit.
		const value = amount / 100;

		try {
			return new Intl.NumberFormat('en-GB', {
				style: 'currency',
				currency: currencyCode || 'GBP',
				maximumFractionDigits: 2
			}).format(value);
		} catch {
			return `${currencyCode || ''} ${value.toFixed(2)}`;
		}
	}

	const formattedAmount = $derived(formatAmount(amountCharged, currency));

	const displayBookingId = $derived(
		bookingId
			? bookingId.length > 18
				? `${bookingId.slice(0, 10)}…${bookingId.slice(-6)}`
				: bookingId
			: '—'
	);
</script>

<SeoHead
	title="Booking Confirmation | Gidi Tour"
	description="Your Gidi Tour booking payment has been received."
	url="https://giditour.com/book/confirmation"
	siteName={data.siteSettings?.siteName ?? 'Gidi Tour'}
/>

<!-- HERO -->
<section
	class="relative overflow-hidden bg-[#f7f3ea] px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24"
>
	<div
		class="pointer-events-none absolute inset-x-0 top-[-10%] h-[60%] bg-[radial-gradient(55%_60%_at_30%_0%,rgba(92,155,25,0.14),transparent_70%)]"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-3xl text-center">
		<span
			class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
		>
			Booking Confirmation
		</span>

		<div
			class="mx-auto mt-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#5C9B19]/10"
		>
			<div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#5C9B19]">
				<Check class="h-7 w-7 text-white" strokeWidth={3} aria-hidden="true" />
			</div>
		</div>

		{#if isPaid}
			<h1
				class="mx-auto mt-7 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
			>
				Payment successful!
			</h1>

			<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
				Thanks{name ? `, ${name}` : ''}. Your booking has been received and your
				{destination || 'trip'} is now being prepared.
			</p>
		{:else}
			<h1
				class="mx-auto mt-7 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
			>
				Your payment is being confirmed
			</h1>

			<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
				We've received your return from the payment provider. We're confirming your payment
				and booking details now.
			</p>
		{/if}
	</div>
</section>

<!-- CONFIRMATION CONTENT -->
<section class="bg-[#f7f3ea] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
	<div class="mx-auto max-w-3xl">
		<!-- MAIN CARD -->
		<div class="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
			<div class="p-6 sm:p-10">
				<!-- STATUS -->
				<div class="flex items-start gap-4 rounded-2xl bg-[#5C9B19]/5 p-5">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#5C9B19]/10"
					>
						{#if isPaid}
							<Check class="h-5 w-5 text-[#5C9B19]" strokeWidth={3} aria-hidden="true" />
						{:else}
							<Clock3 class="h-5 w-5 text-[#5C9B19]" aria-hidden="true" />
						{/if}
					</div>

					<div>
						<p class="text-sm font-bold text-[#17200f]">
							{isPaid ? 'Payment confirmed' : 'Payment confirmation in progress'}
						</p>

						<p class="mt-1 text-sm leading-relaxed text-[#17200f]/55">
							{#if isPaid}
								Your payment has been successfully recorded against this booking.
							{:else}
								Your payment provider has returned you to Gidi Tour. Your booking will be
								updated once the payment confirmation reaches our system.
							{/if}
						</p>
					</div>
				</div>

				<!-- BOOKING REFERENCE -->
				<div class="mt-8 rounded-2xl bg-[#f7f3ea] p-5">
					<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]">
								Booking reference
							</p>

							<p class="mt-1 break-all font-mono text-sm font-semibold text-[#17200f]">
								{displayBookingId}
							</p>
						</div>

						<div class="text-left sm:text-right">
							<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#17200f]/35">
								Status
							</p>

							<p
								class="mt-1 text-sm font-bold capitalize {isPaid
									? 'text-[#5C9B19]'
									: 'text-[#F98315]'}"
							>
								{isPaid ? 'Paid' : 'Pending confirmation'}
							</p>
						</div>
					</div>
				</div>

				<!-- TRIP DETAILS -->
				<div class="mt-8">
					<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]">
						Your trip
					</p>

					<h2 class="mt-2 text-2xl font-medium tracking-[-.02em] text-[#17200f]">
						{destination || 'Your Gidi Tour trip'}
					</h2>

					<div class="mt-6 grid gap-3 sm:grid-cols-2">
						<!-- DESTINATION -->
						<div class="rounded-2xl border border-black/10 p-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C9B19]/10"
								>
									<MapPin class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
								</div>

								<div>
									<p class="text-[10px] font-bold uppercase tracking-wider text-[#17200f]/35">
										Destination
									</p>

									<p class="mt-0.5 text-sm font-semibold text-[#17200f]">
										{destination || '—'}
									</p>
								</div>
							</div>
						</div>

						<!-- TRAVELERS -->
						<div class="rounded-2xl border border-black/10 p-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C9B19]/10"
								>
									<Users class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
								</div>

								<div>
									<p class="text-[10px] font-bold uppercase tracking-wider text-[#17200f]/35">
										Travelers
									</p>

									<p class="mt-0.5 text-sm font-semibold text-[#17200f]">
										{travelers}
										{travelers === 1 ? 'traveler' : 'travelers'}
									</p>
								</div>
							</div>
						</div>

						<!-- START DATE -->
						<div class="rounded-2xl border border-black/10 p-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C9B19]/10"
								>
									<Calendar class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
								</div>

								<div>
									<p class="text-[10px] font-bold uppercase tracking-wider text-[#17200f]/35">
										Start date
									</p>

									<p class="mt-0.5 text-sm font-semibold text-[#17200f]">
										{formatDate(startDate)}
									</p>
								</div>
							</div>
						</div>

						<!-- END DATE -->
						<div class="rounded-2xl border border-black/10 p-4">
							<div class="flex items-center gap-3">
								<div
									class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#5C9B19]/10"
								>
									<Calendar class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
								</div>

								<div>
									<p class="text-[10px] font-bold uppercase tracking-wider text-[#17200f]/35">
										End date
									</p>

									<p class="mt-0.5 text-sm font-semibold text-[#17200f]">
										{formatDate(endDate)}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- PAYMENT DETAILS -->
				{#if formattedAmount}
					<div class="mt-8 border-t border-black/10 pt-8">
						<div class="flex items-center justify-between gap-4">
							<div>
								<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#17200f]/35">
									Payment
								</p>

								<p class="mt-1 text-sm text-[#17200f]/55">
									{methodLabel}
								</p>
							</div>

							<div class="text-right">
								<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#17200f]/35">
									Amount
								</p>

								<p class="mt-1 text-lg font-bold text-[#5C9B19]">
									{formattedAmount}
								</p>
							</div>
						</div>
					</div>
				{/if}

				<!-- EMAIL MESSAGE -->
				<div class="mt-8 flex items-start gap-4 rounded-2xl border border-black/10 p-5">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F98315]/10"
					>
						<Mail class="h-5 w-5 text-[#F98315]" aria-hidden="true" />
					</div>

					<div>
						<p class="text-sm font-bold text-[#17200f]">Your confirmation email</p>

						<p class="mt-1 text-sm leading-relaxed text-[#17200f]/55">
							{#if email}
								We'll send your booking confirmation and next steps to
								<span class="font-medium text-[#17200f]">{email}</span>.
							{:else}
								We'll send your booking confirmation and next steps to the email address
								provided during booking.
							{/if}
						</p>
					</div>
				</div>

				<!-- ACTIONS -->
				<div class="mt-8 flex flex-col gap-3 sm:flex-row">
					<a
						href="/tours"
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#4c8316]"
					>
						Explore More Tours
						<ArrowRight class="h-4 w-4" aria-hidden="true" />
					</a>

					<a
						href="/"
						class="inline-flex flex-1 items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-sm font-bold text-[#17200f]/70 transition hover:border-black/20 hover:text-[#17200f]"
					>
						Back to Home
					</a>
				</div>
			</div>
		</div>

		<!-- TRUST -->
		<div class="mt-6 grid gap-3 sm:grid-cols-3">
			<div class="rounded-2xl bg-white p-5 text-center shadow-sm">
				<ShieldCheck class="mx-auto h-5 w-5 text-[#5C9B19]" aria-hidden="true" />
				<p class="mt-3 text-sm font-semibold text-[#17200f]">Secure payment</p>
				<p class="mt-1 text-xs leading-relaxed text-[#17200f]/45">
					Your payment was processed securely.
				</p>
			</div>

			<div class="rounded-2xl bg-white p-5 text-center shadow-sm">
				<Mail class="mx-auto h-5 w-5 text-[#5C9B19]" aria-hidden="true" />
				<p class="mt-3 text-sm font-semibold text-[#17200f]">Email confirmation</p>
				<p class="mt-1 text-xs leading-relaxed text-[#17200f]/45">
					We'll send your booking details to your email.
				</p>
			</div>

			<div class="rounded-2xl bg-white p-5 text-center shadow-sm">
				<Clock3 class="mx-auto h-5 w-5 text-[#5C9B19]" aria-hidden="true" />
				<p class="mt-3 text-sm font-semibold text-[#17200f]">We're on it</p>
				<p class="mt-1 text-xs leading-relaxed text-[#17200f]/45">
					Our team will follow up with your next steps.
				</p>
			</div>
		</div>
	</div>
</section>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>