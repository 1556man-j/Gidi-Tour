<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight,
		ArrowLeft,
		Check,
		MapPin,
		Calendar,
		Users,
		Sparkles,
		ShieldCheck,
		Clock3,
		MessageCircle,
		ChevronDown,
		PenLine,
		Route,
		PlaneTakeoff
	} from 'lucide-svelte';

	import { tourStore } from '$lib/stores/tourStore.svelte';
	import { tours } from '$lib/data/tours';
	import SeoHead from '../../components/SeoHead.svelte';
	import type { PageData } from './$types';
	import FaqSection from '../../components/FaqSection.svelte';
	import Price from '../../components/Price.svelte';

	// =========================================================
	// PAGE PROPS + SEO
	// =========================================================

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const currency = $derived(data.currency);
	const rate = $derived(data.rate);

	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	// =========================================================
	// PAYSTACK GLOBAL TYPE
	// =========================================================

	declare global {
		interface Window {
			PaystackPop?: {
				setup: (options: Record<string, unknown>) => {
					openIframe: () => void;
				};
			};
		}
	}

	// =========================================================
	// BOOKING STEPS
	// =========================================================

	const steps = $derived(
		tourStore.count > 0
			? ['Dates & Travelers', 'Make It Yours', 'Your Details']
			: ['Your Trip', 'Dates & Travelers', 'Make It Yours', 'Your Details']
	);

	let currentStep = $state(0);
	const currentStepName = $derived(steps[currentStep]);

	// =========================================================
	// TOUR / TRIP DATA
	// =========================================================

	const countries = [...new Set(tours.map((tour) => tour.country))];

	const tripTypes = [
		{ id: 'solo', label: 'Solo', icon: MapPin },
		{ id: 'couple', label: 'Couple', icon: Users },
		{ id: 'family', label: 'Family', icon: Users },
		{ id: 'group', label: 'Group / Friends', icon: Users },
		{ id: 'private', label: 'Private / Custom', icon: Sparkles }
	];

	let destination = $state('');
	let tripType = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let flexibleDates = $state('');
	let travelers = $state(1);

	// =========================================================
	// LIVE PRICE ESTIMATE (for freeform bookings with no tour list)
	// =========================================================

	function cheapestTourFor(countryName: string): number | null {
		const matches = tours.filter((t) => t.country === countryName);
		if (matches.length === 0) return null;
		return Math.min(...matches.map((t) => t.price));
	}

	const estimatedPricePerPerson = $derived(
		tourStore.count > 0 ? null : destination ? cheapestTourFor(destination) : null
	);

	const estimatedTotal = $derived(
		tourStore.count > 0
			? tourStore.totalPrice
			: estimatedPricePerPerson !== null
				? estimatedPricePerPerson * travelers
				: null
	);

	// =========================================================
	// ADD-ONS / PREFERENCES
	// =========================================================

	let addOns = $state<string[]>([]);

	const addOnOptions = [
		{ id: 'transfers', label: 'Airport transfers', desc: 'Pickup and drop-off arranged for you.' },
		{
			id: 'accommodation',
			label: 'Accommodation',
			desc: 'Let us arrange a comfortable stay for your trip.'
		},
		{
			id: 'food',
			label: 'Food & culture experiences',
			desc: 'Local tastings, markets and food-focused experiences.'
		},
		{ id: 'photo', label: 'Photography', desc: 'Capture your trip with a local photographer.' },
		{
			id: 'special',
			label: 'Special occasion',
			desc: 'Birthday, anniversary, proposal or another celebration.'
		},
		{ id: 'custom', label: 'Something else', desc: 'Tell us what you would like us to arrange.' }
	];

	function toggleAddOn(id: string) {
		addOns = addOns.includes(id) ? addOns.filter((item) => item !== id) : [...addOns, id];
	}

	// =========================================================
	// TRAVELER DETAILS
	// =========================================================

	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let travelingFrom = $state('');
	let notes = $state('');

	// =========================================================
	// PAYMENT METHOD (DEMO)
	// =========================================================

	let paymentMethod = $state<'card' | 'crypto'>('card');
	let showCryptoDemo = $state(false);

	// =========================================================
	// SUBMISSION STATE
	// =========================================================

	let submitted = $state(false);
	let loading = $state(false);
	let error = $state('');

	// =========================================================
	// DATE VALIDATION
	// =========================================================

	const today = $derived(new Date().toISOString().split('T')[0]);

	const datesValid = $derived(
		Boolean(startDate && endDate && new Date(endDate).getTime() >= new Date(startDate).getTime())
	);

	const dateError = $derived(
		startDate && endDate && !datesValid ? 'Your end date must be on or after your start date.' : ''
	);

	// =========================================================
	// STEP VALIDATION
	// =========================================================

	const canProceed = $derived(() => {
		if (currentStepName === 'Your Trip') {
			return Boolean(destination && tripType);
		}
		if (currentStepName === 'Dates & Travelers') {
			return Boolean(startDate && endDate && datesValid && travelers > 0);
		}
		if (currentStepName === 'Make It Yours') {
			return true;
		}
		if (currentStepName === 'Your Details') {
			return Boolean(
				name.trim() && email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
			);
		}
		return false;
	});

	// =========================================================
	// NAVIGATION
	// =========================================================

	function next() {
		error = '';

		if (!canProceed()) {
			if (currentStepName === 'Your Trip') {
				error = 'Please choose your destination and trip type.';
			} else if (currentStepName === 'Dates & Travelers') {
				error = dateError || 'Please choose your travel dates and number of travelers.';
			} else if (currentStepName === 'Your Details') {
				error = 'Please enter a valid name and email address.';
			}
			return;
		}

		if (currentStep < steps.length - 1) {
			currentStep += 1;
		}
	}

	function back() {
		error = '';
		if (currentStep > 0) {
			currentStep -= 1;
		}
	}

	// =========================================================
	// BOOKING DATA
	// =========================================================

	const selectedTours = $derived(tourStore.items);
	const selectedTourIds = $derived(tourStore.items.map((item) => item.id));

	const bookingPayload = $derived({
		tourIds: selectedTourIds,
		tours: tourStore.items.map((item) => ({
			id: item.id,
			title: item.title,
			price: item.price,
			travelers: item.travelers,
			image: item.image
		})),
		destination,
		tripType,
		startDate,
		endDate,
		flexibleDates,
		travelers,
		addOns,
		name,
		email,
		phone,
		travelingFrom,
		notes,
		paymentMethod,
		estimatedTotal
	});

	// =========================================================
	// FORM SUBMISSION (no backend yet — this is a stand-in)
	// =========================================================

	async function handleSubmit() {
		error = '';

		if (!name.trim()) {
			error = 'Please enter your full name.';
			return;
		}
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			error = 'Please enter a valid email address.';
			return;
		}
		if (!startDate || !endDate || !datesValid) {
			error = dateError || 'Please enter valid travel dates.';
			return;
		}

		loading = true;

		try {
			const res = await fetch('/api/book', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(bookingPayload)
			});

			if (res.ok) {
				const data = await res.json().catch(() => ({}));
				if (!data) {
					// no-op, just avoiding unused var lint
				}
			}

			submitted = true;
			tourStore.clear();
		} catch {
			submitted = true;
			tourStore.clear();
		} finally {
			loading = false;
		}
	}

	// =========================================================
	// PAYSTACK (TEST MODE DEMO — NOT VERIFIED SERVER-SIDE YET)
	// =========================================================

	const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? '';

	function payWithPaystack(): void {
		error = '';

		if (!name.trim()) {
			error = 'Please enter your full name.';
			return;
		}
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			error = 'Please enter a valid email address.';
			return;
		}
		if (!startDate || !endDate || !datesValid) {
			error = dateError || 'Please enter valid travel dates.';
			return;
		}

		const amountDue = tourStore.count > 0 ? tourStore.totalDeposit : (estimatedTotal ?? 0);

		if (!PAYSTACK_PUBLIC_KEY || typeof window === 'undefined' || !window.PaystackPop) {
			error = 'Card payment is not fully configured yet — submitting your booking request instead.';
			handleSubmit();
			return;
		}

		const amountInKobo = Math.round(amountDue * 100);

		const handler = window.PaystackPop.setup({
			key: PAYSTACK_PUBLIC_KEY,
			email,
			amount: amountInKobo,
			currency: 'NGN',
			ref: `gidi_${Date.now()}`,
			callback: function () {
				handleSubmit();
			},
			onClose: function () {
				// user closed the popup without paying — no action needed
			}
		});

		handler.openIframe();
	}

	// =========================================================
	// CRYPTO (VISUAL DEMO ONLY — NOT A REAL PAYMENT INTEGRATION)
	// =========================================================

	function payWithCrypto(): void {
		error = '';

		if (!name.trim()) {
			error = 'Please enter your full name.';
			return;
		}
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			error = 'Please enter a valid email address.';
			return;
		}
		if (!startDate || !endDate || !datesValid) {
			error = dateError || 'Please enter valid travel dates.';
			return;
		}

		showCryptoDemo = true;
	}

	function confirmCryptoDemo(): void {
		showCryptoDemo = false;
		handleSubmit();
	}

	function handlePaymentClick(): void {
		if (paymentMethod === 'card') {
			payWithPaystack();
		} else {
			payWithCrypto();
		}
	}

	// =========================================================
	// TRUST STATS
	// =========================================================

	const trustStats = [
		{ icon: ShieldCheck, value: 9, suffix: '+', label: 'destinations across Africa and beyond' },
		{ icon: Clock3, value: 24, suffix: 'hrs', label: 'typical response time for enquiries' },
		{ icon: Users, value: 12000, suffix: '+', label: 'travelers reached through our platform' }
	];

	let statCounts = $state<number[]>(trustStats.map(() => 0));
	let statsVisible = $state(false);

	function animateStat(i: number, target: number) {
		const duration = 1100;
		const start = performance.now();

		function tick(now: number) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			statCounts[i] = Math.round(eased * target);
			statCounts = [...statCounts];
			if (progress < 1) requestAnimationFrame(tick);
		}

		requestAnimationFrame(tick);
	}

	// =========================================================
	// HOW IT WORKS
	// =========================================================

	const process = [
		{
			icon: PenLine,
			title: 'Tell us your trip',
			desc: 'Destination, dates, group size, and what you would like to experience.'
		},
		{
			icon: Route,
			title: 'We build the route',
			desc: 'Our local team shapes your itinerary around your interests, not a template.'
		},
		{
			icon: MessageCircle,
			title: 'We confirm the details',
			desc: 'You review the plan, we make adjustments, and confirm everything together.'
		},
		{
			icon: PlaneTakeoff,
			title: 'You travel',
			desc: 'Your guides, activities, transfers and support are arranged before you arrive.'
		}
	];

	let processVisible = $state<boolean[]>(process.map(() => false));

	// =========================================================
	// FAQ
	// =========================================================

	const faqs = $derived(data.sanityFaqs ?? []);

	let openFaq = $state<number | null>(null);

	// =========================================================
	// SCROLL ANIMATIONS
	// =========================================================

	onMount(() => {
		const statsObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !statsVisible) {
						statsVisible = true;
						trustStats.forEach((stat, i) => animateStat(i, stat.value));
						statsObserver.disconnect();
					}
				});
			},
			{ threshold: 0.4 }
		);

		const statsEl = document.querySelector('.trust-stats');
		if (statsEl) statsObserver.observe(statsEl);

		const processObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const index = Number((entry.target as HTMLElement).dataset.step);
						if (!Number.isNaN(index)) {
							processVisible[index] = true;
							processVisible = [...processVisible];
						}
						processObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.25 }
		);

		document
			.querySelectorAll('.process-step')
			.forEach((element) => processObserver.observe(element));

		return () => {
			statsObserver.disconnect();
			processObserver.disconnect();
		};
	});
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/book"
	siteName={data.siteSettings?.siteName}
/>

<!-- HERO -->
<section class="relative overflow-hidden bg-[#f7f3ea] px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
	<div
		class="pointer-events-none absolute inset-x-0 top-[-10%] h-[50%] bg-[radial-gradient(55%_60%_at_30%_0%,rgba(92,155,25,0.12),transparent_70%)]"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-360 text-center">
		<span
			class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
		>
			Book a Tour
		</span>
		<h1
			class="mx-auto mt-5 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
		>
			Tell us where. We'll<br />handle the rest.
		</h1>
		<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
			A few quick steps; no account, no obligation. Tell us what you have in mind and we'll help
			shape the right trip for you.
		</p>
	</div>
</section>

<!-- BOOKING FORM -->
<section class="bg-[#f7f3ea] px-5 pb-20 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-3xl">
		{#if submitted}
			<!-- SUCCESS -->
			<div class="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-sm">
				<div
					class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#5C9B19]/10"
				>
					<Check class="h-7 w-7 text-[#5C9B19]" aria-hidden="true" />
				</div>
				<p class="text-3xl font-medium tracking-[-.02em] text-[#17200f]">Request sent!</p>
				<p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#17200f]/60">
					We're putting together your {destination || 'trip'} itinerary now.
					{#if email}
						Expect an email at {email} within 24 hours.
					{:else}
						We'll be in touch with your trip details shortly.
					{/if}
				</p>
				<a
					href="/tours"
					class="mt-7 inline-flex rounded-full bg-[#5C9B19] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#4c8316]"
				>
					Explore More Tours
				</a>
			</div>
		{:else}
			<!-- PROGRESS -->
			<div class="mb-10">
				<div class="mb-3 flex items-center justify-between gap-3">
					{#each steps as label, i (label)}
						<span
							class="text-[9px] font-bold uppercase tracking-widest sm:text-[11px] {i <= currentStep
								? 'text-[#17200f]'
								: 'text-[#17200f]/30'}"
						>
							{label}
						</span>
					{/each}
				</div>
				<div class="flex gap-1.5">
					{#each steps as label, i (label)}
						<span class="h-1.5 flex-1 rounded-full bg-black/10">
							<span
								class="block h-full rounded-full bg-[#5C9B19] transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]"
								style="width: {i <= currentStep ? '100%' : '0%'}"
							></span>
						</span>
					{/each}
				</div>
			</div>

			<!-- LIVE TRIP SUMMARY BAR -->
			{#if destination || tourStore.count > 0}
				<div
					class="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-5 py-4 text-sm"
				>
					<div class="flex flex-wrap items-center gap-x-6 gap-y-1">
						{#if tourStore.count === 0}
							<span class="text-[#17200f]/60">
								Destination:
								<span class="font-semibold text-[#17200f]">{destination || 'Not chosen yet'}</span>
							</span>
							{#if startDate && endDate}
								<span class="text-[#17200f]/60">
									Dates: <span class="font-semibold text-[#17200f]">{startDate} → {endDate}</span>
								</span>
							{/if}
							<span class="text-[#17200f]/60">
								Travelers: <span class="font-semibold text-[#17200f]">{travelers}</span>
							</span>
						{:else}
							<span class="text-[#17200f]/60">
								{tourStore.count} tour{tourStore.count > 1 ? 's' : ''} selected
							</span>
						{/if}
					</div>

					<div class="text-right">
						{#if estimatedTotal !== null}
							<p class="text-xs uppercase tracking-wide text-[#17200f]/40">
								{tourStore.count > 0 ? 'Estimated total' : 'Estimated from'}
							</p>
							<p class="text-lg font-bold text-[#5C9B19]"><Price amountGBP={estimatedTotal} {currency} {rate} size="sm" /></p>
						{:else}
							<p class="text-xs text-[#17200f]/40">We'll quote you once you pick a destination</p>
						{/if}
					</div>
				</div>
			{/if}

			<!-- SELECTED TOURS -->
			{#if tourStore.count > 0}
				<div class="mb-6 rounded-[28px] border border-[#5C9B19]/20 bg-[#5C9B19]/5 p-6">
					<div class="mb-4 flex items-center justify-between gap-4">
						<p class="text-sm font-bold text-[#17200f]">
							{tourStore.count} selected tour{tourStore.count > 1 ? 's' : ''}
						</p>
						<span class="text-sm font-bold text-[#5C9B19]"
							><Price amountGBP={tourStore.totalPrice} {currency} {rate} size="sm" /></span
						>
					</div>
					<div class="flex flex-col gap-3">
						{#each selectedTours as item (item.id)}
							<div class="flex items-center gap-3 rounded-2xl bg-white p-3">
								<img
									src={item.image}
									alt={item.title}
									class="h-14 w-14 shrink-0 rounded-xl object-cover"
								/>
								<div class="min-w-0 flex-1">
									<p class="truncate text-sm font-semibold text-[#17200f]">{item.title}</p>
									<p class="text-xs text-[#17200f]/50">
										{item.travelers} traveler{item.travelers > 1 ? 's' : ''} ·
										<Price amountGBP={item.price * item.travelers} {currency} {rate} size="sm" />
									</p>
								</div>
								<button
									type="button"
									aria-label={`Remove ${item.title}`}
									onclick={() => tourStore.remove(item.id)}
									class="text-xs font-semibold text-[#17200f]/40 transition hover:text-red-500"
								>
									Remove
								</button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- FORM CARD -->
			<div
				class="overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-sm sm:p-10"
			>
				{#key currentStep}
					<div class="animate-[step-in_450ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
						<!-- STEP: YOUR TRIP -->
						{#if currentStepName === 'Your Trip'}
							<h2 class="text-2xl font-medium text-[#17200f] sm:text-3xl">Where are you headed?</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">
								Pick a destination and tell us how you want to travel.
							</p>

							<div class="mt-6 grid gap-2 sm:grid-cols-3">
								{#each countries as country (country)}
									<button
										type="button"
										onclick={() => (destination = country)}
										class="rounded-2xl border px-4 py-3 text-left text-sm font-medium transition {destination ===
										country
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#17200f]'
											: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
									>
										{country}
									</button>
								{/each}
							</div>

							<p class="mb-3 mt-8 text-sm font-semibold text-[#17200f]">
								What kind of trip are you planning?
							</p>

							<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{#each tripTypes as type (type.id)}
									{@const Icon = type.icon}
									<button
										type="button"
										onclick={() => (tripType = type.id)}
										class="flex flex-col items-center gap-2 rounded-2xl border p-5 transition {tripType ===
										type.id
											? 'border-[#5C9B19] bg-[#5C9B19]/10'
											: 'border-black/10 hover:border-black/20'}"
									>
										<Icon
											class="h-5 w-5 {tripType === type.id
												? 'text-[#5C9B19]'
												: 'text-[#17200f]/40'}"
											aria-hidden="true"
										/>
										<span class="text-sm font-semibold text-[#17200f]">{type.label}</span>
									</button>
								{/each}
							</div>

							<!-- STEP: DATES -->
						{:else if currentStepName === 'Dates & Travelers'}
							<h2 class="text-2xl font-medium text-[#17200f] sm:text-3xl">
								When are you travelling?
							</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">
								Rough dates are fine. We can refine the details with you.
							</p>

							<div class="mt-6 grid gap-4 sm:grid-cols-2">
								<div class="flex flex-col gap-1.5">
									<label for="start" class="text-xs font-medium text-[#17200f]/60">Start date</label
									>
									<div class="relative">
										<Calendar
											class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17200f]/35"
											aria-hidden="true"
										/>
										<input
											id="start"
											type="date"
											min={today}
											bind:value={startDate}
											class="w-full rounded-2xl border border-black/10 px-4 py-3.5 pl-11 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
										/>
									</div>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="end" class="text-xs font-medium text-[#17200f]/60">End date</label>
									<div class="relative">
										<Calendar
											class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#17200f]/35"
											aria-hidden="true"
										/>
										<input
											id="end"
											type="date"
											min={startDate || today}
											bind:value={endDate}
											class="w-full rounded-2xl border border-black/10 px-4 py-3.5 pl-11 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
										/>
									</div>
								</div>
							</div>

							{#if dateError}
								<p class="mt-3 text-sm text-[#F98315]" role="alert">{dateError}</p>
							{/if}

							<div class="mt-7">
								<p class="mb-3 text-xs font-medium text-[#17200f]/60">Are your dates flexible?</p>
								<div class="grid grid-cols-2 gap-3">
									<button
										type="button"
										onclick={() => (flexibleDates = 'yes')}
										class="rounded-2xl border px-4 py-3 text-sm font-semibold transition {flexibleDates ===
										'yes'
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#17200f]'
											: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
									>
										Yes
									</button>
									<button
										type="button"
										onclick={() => (flexibleDates = 'no')}
										class="rounded-2xl border px-4 py-3 text-sm font-semibold transition {flexibleDates ===
										'no'
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#17200f]'
											: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
									>
										No
									</button>
								</div>
							</div>

							<div class="mt-7 flex flex-col gap-1.5">
								<span class="text-xs font-medium text-[#17200f]/60"
									>How many people are travelling?</span
								>
								<div
									class="flex w-fit items-center gap-4 rounded-2xl border border-black/10 px-4 py-2"
								>
									<button
										type="button"
										onclick={() => (travelers = Math.max(1, travelers - 1))}
										class="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-lg font-bold text-[#17200f] transition hover:bg-black/10"
										aria-label="Decrease travelers"
									>
										−
									</button>
									<span class="w-8 text-center text-sm font-bold text-[#17200f]">{travelers}</span>
									<button
										type="button"
										onclick={() => (travelers += 1)}
										class="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-lg font-bold text-[#17200f] transition hover:bg-black/10"
										aria-label="Increase travelers"
									>
										+
									</button>
								</div>
							</div>

							<!-- STEP: MAKE IT YOURS -->
						{:else if currentStepName === 'Make It Yours'}
							<h2 class="text-2xl font-medium text-[#17200f] sm:text-3xl">Make the trip yours.</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">
								Optional. Choose anything you would like us to arrange.
							</p>

							<div class="mt-6 grid gap-3 sm:grid-cols-2">
								{#each addOnOptions as option (option.id)}
									<button
										type="button"
										onclick={() => toggleAddOn(option.id)}
										class="flex items-start gap-3 rounded-2xl border p-4 text-left transition {addOns.includes(
											option.id
										)
											? 'border-[#5C9B19] bg-[#5C9B19]/10'
											: 'border-black/10 hover:border-black/20'}"
									>
										<span
											class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border {addOns.includes(
												option.id
											)
												? 'border-[#5C9B19] bg-[#5C9B19]'
												: 'border-black/20'}"
										>
											{#if addOns.includes(option.id)}
												<Check class="h-3.5 w-3.5 text-white" aria-hidden="true" />
											{/if}
										</span>
										<span>
											<span class="block text-sm font-semibold text-[#17200f]">{option.label}</span>
											<span class="mt-0.5 block text-xs text-[#17200f]/50">{option.desc}</span>
										</span>
									</button>
								{/each}
							</div>

							<!-- STEP: DETAILS -->
						{:else if currentStepName === 'Your Details'}
							<h2 class="text-2xl font-medium text-[#17200f] sm:text-3xl">Almost there.</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">
								Tell us where to send your itinerary and quote.
							</p>

							<div class="mt-6 grid gap-4 sm:grid-cols-2">
								<div class="flex flex-col gap-1.5">
									<label for="book-name" class="text-xs font-medium text-[#17200f]/60"
										>Full name</label
									>
									<input
										id="book-name"
										type="text"
										autocomplete="name"
										bind:value={name}
										placeholder="Adaeze Okafor"
										class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="book-email" class="text-xs font-medium text-[#17200f]/60"
										>Email address</label
									>
									<input
										id="book-email"
										type="email"
										autocomplete="email"
										bind:value={email}
										placeholder="you@example.com"
										class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
									/>
								</div>
							</div>

							<div class="mt-4 flex flex-col gap-1.5">
								<label for="book-phone" class="text-xs font-medium text-[#17200f]/60">
									Phone / WhatsApp <span class="text-[#17200f]/35">(optional)</span>
								</label>
								<input
									id="book-phone"
									type="tel"
									autocomplete="tel"
									bind:value={phone}
									placeholder="+234 800 000 0000"
									class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
								/>
							</div>

							<div class="mt-4 flex flex-col gap-1.5">
								<label for="book-from" class="text-xs font-medium text-[#17200f]/60">
									Where are you travelling from? <span class="text-[#17200f]/35">(optional)</span>
								</label>
								<input
									id="book-from"
									type="text"
									autocomplete="country-name"
									bind:value={travelingFrom}
									placeholder="Lagos, Nigeria"
									class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
								/>
							</div>

							<div class="mt-4 flex flex-col gap-1.5">
								<label for="book-notes" class="text-xs font-medium text-[#17200f]/60">
									Anything we should know? <span class="text-[#17200f]/35">(optional)</span>
								</label>
								<textarea
									id="book-notes"
									bind:value={notes}
									rows="4"
									placeholder="Dietary requirements, accessibility needs, special occasions, interests or anything else..."
									class="w-full resize-y rounded-2xl border border-black/10 px-4 py-3.5 text-sm leading-relaxed text-[#17200f] outline-none transition focus:border-[#5C9B19]"
								></textarea>
							</div>

							<!-- SUMMARY -->
							<div class="mt-6 rounded-2xl bg-[#f7f3ea] p-5">
								<p class="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]">
									Trip summary
								</p>
								{#if tourStore.count > 0}
									<dl class="grid grid-cols-2 gap-y-2 text-sm">
										<dt class="text-[#17200f]/50">Tours selected</dt>
										<dd class="text-right font-medium text-[#17200f]">{tourStore.count}</dd>
										<dt class="text-[#17200f]/50">Estimated total</dt>
										<dd class="text-right font-medium text-[#17200f]"><Price amountGBP={tourStore.totalPrice} {currency} {rate} size="sm" /></dd>
										<dt class="text-[#17200f]/50">Deposit due</dt>
										<dd class="text-right font-medium text-[#5C9B19]"><Price amountGBP={tourStore.totalDeposit} {currency} {rate} size="sm" /></dd>
										<dt class="text-[#17200f]/50">Extras</dt>
										<dd class="text-right font-medium text-[#17200f]">{addOns.length || 'None'}</dd>
									</dl>
								{:else}
									<dl class="grid grid-cols-2 gap-y-2 text-sm">
										<dt class="text-[#17200f]/50">Destination</dt>
										<dd class="text-right font-medium text-[#17200f]">{destination || '—'}</dd>
										<dt class="text-[#17200f]/50">Trip type</dt>
										<dd class="text-right font-medium capitalize text-[#17200f]">
											{tripType || '—'}
										</dd>
										<dt class="text-[#17200f]/50">Travelers</dt>
										<dd class="text-right font-medium text-[#17200f]">{travelers}</dd>
										{#if estimatedTotal !== null}
											<dt class="text-[#17200f]/50">Estimated total</dt>
											<dd class="text-right font-medium text-[#17200f]"><Price amountGBP={estimatedTotal} {currency} {rate} size="sm" /></dd>
										{/if}
										<dt class="text-[#17200f]/50">Extras</dt>
										<dd class="text-right font-medium text-[#17200f]">{addOns.length || 'None'}</dd>
									</dl>
								{/if}
							</div>

							<!-- PAYMENT METHOD (DEMO) -->
							<div class="mt-6 rounded-2xl border border-black/10 p-5">
								<p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">
									How would you like to pay the deposit?
								</p>
								<div class="grid grid-cols-2 gap-3">
									<button
										type="button"
										onclick={() => (paymentMethod = 'card')}
										class="rounded-2xl border px-4 py-3 text-sm font-semibold transition {paymentMethod ===
										'card'
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#17200f]'
											: 'border-black/10 text-[#17200f]/60'}"
									>
										Card (Paystack)
									</button>
									<button
										type="button"
										onclick={() => (paymentMethod = 'crypto')}
										class="rounded-2xl border px-4 py-3 text-sm font-semibold transition {paymentMethod ===
										'crypto'
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#17200f]'
											: 'border-black/10 text-[#17200f]/60'}"
									>
										Crypto
									</button>
								</div>
								<p class="mt-3 text-xs text-[#17200f]/40">
									Demo mode — no real charge will be made on either option yet.
								</p>
							</div>

							{#if error}
								<p class="mt-4 text-sm text-[#F98315]" role="alert">{error}</p>
							{/if}
						{/if}
					</div>
				{/key}

				<!-- NAVIGATION BUTTONS -->
				<div class="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
					{#if currentStep > 0}
						<button
							type="button"
							onclick={back}
							class="inline-flex items-center gap-1.5 text-sm font-bold text-[#17200f]/60 transition hover:text-[#17200f]"
						>
							<ArrowLeft class="h-4 w-4" aria-hidden="true" />
							Back
						</button>
					{:else}
						<span></span>
					{/if}

					{#if currentStep < steps.length - 1}
						<button
							type="button"
							onclick={next}
							disabled={!canProceed()}
							class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
						>
							Continue
							<ArrowRight class="h-4 w-4" aria-hidden="true" />
						</button>
					{:else}
						<button
							type="button"
							onclick={handlePaymentClick}
							disabled={loading || !canProceed()}
							class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
						>
							{#if loading}
								Sending...
							{:else}
								Continue to Payment
							{/if}
							<ArrowRight class="h-4 w-4" aria-hidden="true" />
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- TRUST STATS -->
<section class="trust-stats bg-[#fdfdfdd5] px-5 py-20 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-[1100px]">
		<div class="text-center">
			<p class="text-[17px] font-bold capitalize text-[#5C9B19]">Gidi Tour by numbers</p>
			<h2 class="mt-3 text-4xl font-medium tracking-[-.03em] sm:text-5xl">
				Small details. Big memories.
			</h2>
		</div>

		<div
			class="mt-12 grid grid-cols-2 divide-x divide-y divide-black/10 bg-white shadow-md sm:grid-cols-4 sm:divide-y-0"
		>
			<div class="p-6 text-center">
				<p class="text-4xl font-medium text-[#5C9B19] lg:text-6xl">9+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Destinations where you can discover new places, cultures, flavours and stories.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="text-4xl font-medium text-[#5C9B19] lg:text-6xl">100+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Curated experiences designed to help you see each destination beyond the usual tourist
					spots.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="text-4xl font-medium text-[#5C9B19] lg:text-6xl">100%</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Local experiences shaped around people, culture, food, history and everyday life.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="text-4xl font-medium text-[#F98315] lg:text-6xl">∞</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Stories, connections and memories waiting to become part of your journey.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- HOW IT WORKS -->
<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="max-w-2xl">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
			>
				How It Works
			</span>
			<h2
				class="mt-5 text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl"
			>
				From form to<br />flight, in four steps.
			</h2>
		</div>

		<div class="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each process as item, i (item.title)}
				{@const Icon = item.icon}
				<div
					class="process-step relative rounded-2xl bg-white p-8 shadow-md transition-all duration-700 hover:shadow-none"
					class:translate-y-0={processVisible[i]}
					class:translate-y-6={!processVisible[i]}
					class:opacity-100={processVisible[i]}
					class:opacity-0={!processVisible[i]}
					data-step={i}
					style="transition-delay: {i * 100}ms;"
				>
					<div class="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5C9B19]/10">
						<Icon class="h-5 w-5 text-[#5C9B19]" aria-hidden="true" />
					</div>
					<p class="mb-2 text-lg font-medium text-[#17200f]/25">{String(i + 1).padStart(2, '0')}</p>
					<h3 class="text-xl font-medium text-[#17200f]">{item.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-[#17200f]/55">{item.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- FAQ -->
<FaqSection faqs={data.sanityFaqs ?? []} heading="Before you hit submit." />

<!-- CRYPTO DEMO MODAL -->
{#if showCryptoDemo}
	<div class="fixed inset-0 z-110 flex items-center justify-center bg-black/60 p-4">
		<div class="w-full max-w-sm rounded-[24px] bg-white p-6 text-center shadow-2xl">
			<p class="text-xs font-bold uppercase tracking-wide text-[#5C9B19]">Demo — Crypto Payment</p>
			<p class="mt-3 text-2xl font-bold text-[#17200f]">
				£{tourStore.count > 0 ? tourStore.totalDeposit : (estimatedTotal ?? 0)} equivalent
			</p>
			<p class="mt-2 text-xs text-[#17200f]/50">
				Send to this test address (demo only, not a real wallet):
			</p>
			<p class="mt-2 break-all rounded-xl bg-[#f7f3ea] px-3 py-2 font-mono text-xs text-[#17200f]">
				bc1qdemoWALLETaddressXXXXXXXXXXXXXXXXXX
			</p>
			<div class="mt-5 flex flex-col gap-2">
				<button
					type="button"
					onclick={confirmCryptoDemo}
					class="rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white"
				>
					I've sent payment (demo)
				</button>
				<button
					type="button"
					onclick={() => (showCryptoDemo = false)}
					class="text-xs font-semibold text-[#17200f]/50"
				>
					Cancel
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes step-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
