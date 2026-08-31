<script lang="ts">
	import { onMount } from 'svelte';
	import {
		ArrowRight, ArrowLeft, Check, MapPin, Calendar, Users, Sparkles,
		ShieldCheck, Clock3, MessageCircle, ChevronDown, PenLine, Route, PlaneTakeoff
	} from 'lucide-svelte';

	// ---------- STEP STATE ----------
	const steps = ['Destination', 'Dates & Travelers', 'Add-ons', 'Your Details'];
	let currentStep = $state(0);

	// ---------- FORM STATE ----------
	const destinations = [
		'Lagos, Nigeria', 'Accra, Ghana', 'Nairobi, Kenya', 'Zanzibar, Tanzania',
		'Kigali, Rwanda', 'Cairo, Egypt', 'Marrakech, Morocco', 'Cape Town, South Africa', 'London, UK'
	];
	const tripTypes = [
		{ id: 'solo', label: 'Solo', icon: MapPin },
		{ id: 'group', label: 'Group / Friends', icon: Users },
		{ id: 'private', label: 'Private / Custom', icon: Sparkles }
	];

	let destination = $state('');
	let tripType = $state('');
	let startDate = $state('');
	let endDate = $state('');
	let travelers = $state(1);
	let addOns = $state<string[]>([]);
	let name = $state('');
	let email = $state('');
	let phone = $state('');
	let notes = $state('');

	const addOnOptions = [
		{ id: 'guide', label: 'Private local guide', desc: 'A dedicated guide for your whole trip.' },
		{ id: 'transfers', label: 'Airport transfers', desc: 'Pickup and drop-off, no ride-hailing needed.' },
		{ id: 'food', label: 'Food & culture tour', desc: 'Guided tastings and market visits.' },
		{ id: 'photo', label: 'Photography package', desc: 'A local photographer for a day.' }
	];

	function toggleAddOn(id: string) {
		addOns = addOns.includes(id) ? addOns.filter((a) => a !== id) : [...addOns, id];
	}

	const canProceed = $derived(
		currentStep === 0 ? Boolean(destination && tripType) :
		currentStep === 1 ? Boolean(startDate && endDate && travelers > 0) :
		currentStep === 2 ? true :
		Boolean(name && email)
	);

	let submitted = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		if (!name || !email) {
			error = 'Please fill in your name and email.';
			return;
		}
		loading = true;
		error = '';
		try {
			const res = await fetch('/api/book', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ destination, tripType, startDate, endDate, travelers, addOns, name, email, phone, notes })
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				error = data.error ?? 'Something went wrong. Please try again.';
			} else {
				submitted = true;
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function next() {
		if (canProceed && currentStep < steps.length - 1) currentStep += 1;
	}
	function back() {
		if (currentStep > 0) currentStep -= 1;
	}

	// ---------- WHY BOOK STATS (count-up on scroll) ----------
	const trustStats = [
		{ icon: ShieldCheck, value: 9, suffix: '', label: 'countries covered' },
		{ icon: Clock3, value: 24, suffix: 'hrs', label: 'average response time' },
		{ icon: Users, value: 12000, suffix: '+', label: 'travelers booked' }
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

	// ---------- PROCESS STEPS (draw-on reveal) ----------
	const process = [
		{ icon: PenLine, title: 'Tell us your trip', desc: 'Destination, dates, group size, and what you\u2019re actually curious about.' },
		{ icon: Route, title: 'We build the route', desc: 'A local team shapes an itinerary around your answers, not a template.' },
		{ icon: MessageCircle, title: 'We confirm details', desc: 'You review, we adjust, and lock in the plan together, no surprises.' },
		{ icon: PlaneTakeoff, title: 'You travel', desc: 'Guides, transfers and support are already arranged before you land.' }
	];
	let processVisible = $state<boolean[]>(process.map(() => false));

	// ---------- FAQ ----------
	const faqs = [
		{ q: 'How far in advance should I book?', a: 'At least 3\u20134 weeks for most routes, 6+ weeks for peak season (Nov\u2013Feb across West Africa, Jun\u2013Sep for East African safaris) or larger groups.' },
		{ q: 'Can I customize an existing itinerary?', a: 'Yes, most bookings start from one of our routes and get adjusted from there. Flag what you want changed in step 4 and we\u2019ll follow up before confirming anything.' },
		{ q: 'What\u2019s included in the price?', a: 'Varies by trip, but typically covers accommodation, a local guide, listed activities, and ground transport. Flights and personal spending are usually separate. We\u2019ll break it down in your quote.' },
		{ q: 'What if I need to cancel or reschedule?', a: 'Policies vary slightly by destination and season, but we always confirm cancellation terms in writing before you pay anything. No surprises at the end.' },
		{ q: 'Do you book for solo travelers?', a: 'Constantly. Solo is one of our most common trip types, select it in step 1 and we\u2019ll tailor pacing and group-activity options accordingly.' }
	];
	let openFaq = $state<number | null>(null);

	onMount(() => {
		const statsObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !statsVisible) {
						statsVisible = true;
						trustStats.forEach((s, i) => animateStat(i, s.value));
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
						const i = Number((entry.target as HTMLElement).dataset.step);
						processVisible[i] = true;
						processVisible = [...processVisible];
						processObserver.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.4 }
		);
		document.querySelectorAll('.process-step').forEach((el) => processObserver.observe(el));

		return () => {
			statsObserver.disconnect();
			processObserver.disconnect();
		};
	});
</script>

<svelte:head>
	<title>Book a Tour — Gidi Tour</title>
	<meta
		name="description"
		content="Book your next trip with Gidi Tour — tell us where, when and who's coming, and we'll build a route around it."
	/>
</svelte:head>

<!-- HERO -->
<section class="relative overflow-hidden bg-[#f7f3ea] px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
	<div
		class="pointer-events-none absolute inset-x-0 -top-[10%] h-[50%] bg-[radial-gradient(55%_60%_at_30%_0%,rgba(92,155,25,0.12),transparent_70%)]"
		aria-hidden="true"
	></div>
	<div class="relative mx-auto max-w-[1440px] text-center">
		<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm">
			Book a Tour
		</span>
		<h1 class="font-bold mx-auto mt-5 max-w-2xl text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl">
			Tell us where. We'll<br />handle the rest.
		</h1>
		<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
			Four quick steps; no account, no obligation. We'll follow up with a real itinerary and
			pricing within a day.
		</p>
	</div>
</section>

<!-- BOOKING FORM -->
<section class="bg-[#f7f3ea] px-5 pb-20 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-3xl">
		{#if submitted}
			<div class="rounded-[28px] border border-black/10 bg-white p-10 text-center shadow-sm">
				<div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#5C9B19]/10">
					<Check class="h-7 w-7 text-[#5C9B19]" aria-hidden="true" />
				</div>
				<p class="font-medium text-3xl tracking-[-.02em] text-[#17200f]">Request sent!</p>
				<p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#17200f]/60">
					We're putting together your {destination || 'trip'} itinerary now. Expect an email at
					{email} within 24 hours.
				</p>
			</div>
		{:else}
			<!-- Progress -->
			<div class="mb-10">
				<div class="mb-3 flex items-center justify-between">
					{#each steps as label, i (label)}
						<span class="text-[11px] font-bold uppercase tracking-[.1em] {i <= currentStep ? 'text-[#17200f]' : 'text-[#17200f]/30'}">
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

			<div class="overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-sm sm:p-10">
				{#key currentStep}
					<div class="animate-[step-in_450ms_cubic-bezier(0.16,1,0.3,1)_forwards]">
						{#if currentStep === 0}
							<h2 class="font-medium text-2xl text-[#17200f] sm:text-3xl">Where are you headed?</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">Pick a destination and how you're traveling.</p>

							<div class="mt-6 grid gap-2 sm:grid-cols-3">
								{#each destinations as d (d)}
									<button
										type="button"
										onclick={() => (destination = d)}
										class="rounded-2xl border px-4 py-3 text-left text-sm font-medium transition {destination === d
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#17200f]'
											: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
									>
										{d}
									</button>
								{/each}
							</div>

							<p class="mb-3 mt-8 text-sm font-semibold text-[#17200f]">Trip type</p>
							<div class="grid gap-3 sm:grid-cols-3">
								{#each tripTypes as type (type.id)}
									{@const Icon = type.icon}
									<button
										type="button"
										onclick={() => (tripType = type.id)}
										class="flex flex-col items-center gap-2 rounded-2xl border p-5 transition {tripType === type.id
											? 'border-[#5C9B19] bg-[#5C9B19]/10'
											: 'border-black/10 hover:border-black/20'}"
									>
										<Icon class="h-5 w-5 {tripType === type.id ? 'text-[#5C9B19]' : 'text-[#17200f]/40'}" aria-hidden="true" />
										<span class="text-sm font-semibold text-[#17200f]">{type.label}</span>
									</button>
								{/each}
							</div>
						{:else if currentStep === 1}
							<h2 class="font-medium text-2xl text-[#17200f] sm:text-3xl">When, and how many?</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">Rough dates are fine \u2014 we'll refine them with you.</p>

							<div class="mt-6 grid gap-4 sm:grid-cols-2">
								<div class="flex flex-col gap-1.5">
									<label for="start" class="text-xs font-medium text-[#17200f]/60">Start date</label>
									<input
										id="start"
										type="date"
										bind:value={startDate}
										class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="end" class="text-xs font-medium text-[#17200f]/60">End date</label>
									<input
										id="end"
										type="date"
										bind:value={endDate}
										class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
									/>
								</div>
							</div>

							<div class="mt-6 flex flex-col gap-1.5">
								<span class="text-xs font-medium text-[#17200f]/60">Travelers</span>
								<div class="flex w-fit items-center gap-4 rounded-2xl border border-black/10 px-4 py-2">
									<button
										type="button"
										onclick={() => (travelers = Math.max(1, travelers - 1))}
										class="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-lg font-bold text-[#17200f] transition hover:bg-black/10"
										aria-label="Decrease travelers"
									>
										−
									</button>
									<span class="w-6 text-center text-sm font-bold text-[#17200f]">{travelers}</span>
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
						{:else if currentStep === 2}
							<h2 class="font-medium text-2xl text-[#17200f] sm:text-3xl">Want to add anything?</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">Optional \u2014 skip this if you're not sure yet.</p>

							<div class="mt-6 grid gap-3 sm:grid-cols-2">
								{#each addOnOptions as opt (opt.id)}
									<button
										type="button"
										onclick={() => toggleAddOn(opt.id)}
										class="flex items-start gap-3 rounded-2xl border p-4 text-left transition {addOns.includes(opt.id)
											? 'border-[#5C9B19] bg-[#5C9B19]/10'
											: 'border-black/10 hover:border-black/20'}"
									>
										<span
											class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border {addOns.includes(opt.id)
												? 'border-[#5C9B19] bg-[#5C9B19]'
												: 'border-black/20'}"
										>
											{#if addOns.includes(opt.id)}
												<Check class="h-3.5 w-3.5 text-white" aria-hidden="true" />
											{/if}
										</span>
										<span>
											<span class="block text-sm font-semibold text-[#17200f]">{opt.label}</span>
											<span class="mt-0.5 block text-xs text-[#17200f]/50">{opt.desc}</span>
										</span>
									</button>
								{/each}
							</div>
						{:else}
							<h2 class="font-medium text-2xl text-[#17200f] sm:text-3xl">Where should we send it?</h2>
							<p class="mt-2 text-sm text-[#17200f]/55">Your itinerary and quote land here.</p>

							<div class="mt-6 grid gap-4 sm:grid-cols-2">
								<div class="flex flex-col gap-1.5">
									<label for="book-name" class="text-xs font-medium text-[#17200f]/60">Full name</label>
									<input
										id="book-name"
										type="text"
										bind:value={name}
										placeholder="Adaeze Okafor"
										class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="book-email" class="text-xs font-medium text-[#17200f]/60">Email</label>
									<input
										id="book-email"
										type="email"
										bind:value={email}
										placeholder="you@example.com"
										class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
									/>
								</div>
							</div>

							<div class="mt-4 flex flex-col gap-1.5">
								<label for="book-phone" class="text-xs font-medium text-[#17200f]/60">Phone <span class="text-[#17200f]/35">(optional)</span></label>
								<input
									id="book-phone"
									type="tel"
									bind:value={phone}
									placeholder="080X XXX XXXX"
									class="w-full rounded-2xl border border-black/10 px-4 py-3.5 text-sm text-[#17200f] outline-none transition focus:border-[#5C9B19]"
								/>
							</div>

							<div class="mt-4 flex flex-col gap-1.5">
								<label for="book-notes" class="text-xs font-medium text-[#17200f]/60">Anything else? <span class="text-[#17200f]/35">(optional)</span></label>
								<textarea
									id="book-notes"
									bind:value={notes}
									rows="4"
									placeholder="Special requests, questions, anything we should know..."
									class="w-full resize-y rounded-2xl border border-black/10 px-4 py-3.5 text-sm leading-relaxed text-[#17200f] outline-none transition focus:border-[#5C9B19]"
								></textarea>
							</div>

							<!-- Summary -->
							<div class="mt-6 rounded-2xl bg-[#f7f3ea] p-5">
								<p class="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]">Trip summary</p>
								<dl class="grid grid-cols-2 gap-y-2 text-sm">
									<dt class="text-[#17200f]/50">Destination</dt>
									<dd class="text-right font-medium text-[#17200f]">{destination || '—'}</dd>
									<dt class="text-[#17200f]/50">Trip type</dt>
									<dd class="text-right font-medium capitalize text-[#17200f]">{tripType || '—'}</dd>
									<dt class="text-[#17200f]/50">Travelers</dt>
									<dd class="text-right font-medium text-[#17200f]">{travelers}</dd>
									<dt class="text-[#17200f]/50">Add-ons</dt>
									<dd class="text-right font-medium text-[#17200f]">{addOns.length || 'None'}</dd>
								</dl>
							</div>

							{#if error}
								<p class="mt-4 text-sm text-[#F98315]" role="alert">{error}</p>
							{/if}
						{/if}
					</div>
				{/key}

				<!-- Nav buttons -->
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
							disabled={!canProceed}
							class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
						>
							Continue
							<ArrowRight class="h-4 w-4" aria-hidden="true" />
						</button>
					{:else}
						<button
							type="button"
							onclick={handleSubmit}
							disabled={loading || !canProceed}
							class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
						>
							{loading ? 'Sending…' : 'Request Itinerary'}
							<ArrowRight class="h-4 w-4" aria-hidden="true" />
						</button>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<!-- TRUST STATS -->
<section class="bg-[#fdfdfdd5] px-5 py-20 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-[1100px]">
		<div class="reveal text-center">
			<p class="text-[17px] font-bold capitalize text-[#5C9B19]">Gidi Tour by numbers</p>
			<h2 class="font-medium mt-3 text-4xl tracking-[-.03em] sm:text-5xl">
				Small details. Big memories.
			</h2>
		</div>

		<div
			class="reveal mt-12 bg-white shadow-md grid grid-cols-2 divide-x divide-y divide-black/10 sm:grid-cols-4 sm:divide-y-0"
		>
			<div class="p-6 text-center">
				<p class="font-medium text-4xl lg:text-6xl text-[#5C9B19]">09+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Countries where you can discover new places, cultures, flavours, and stories.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-medium text-4xl lg:text-6xl text-[#5C9B19]">100+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Curated experiences designed to help you see each destination beyond the usual tourist
					spots.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-medium text-4xl lg:text-6xl text-[#5C9B19]">100%</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Local experiences built around the people, culture, food, history, and everyday life of
					each destination.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-medium text-4xl lg:text-6xl text-[#F98315]">∞</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Stories, connections, and memories waiting to become part of your journey.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- HOW IT WORKS -->
<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="max-w-2xl">
			<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm">
				How It Works
			</span>
			<h2 class="font-bold mt-5 text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl">
				From form to<br />flight, in four steps.
			</h2>
		</div>

		<div class="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
			{#each process as p, i (p.title)}
				{@const Icon = p.icon}
				<div
					class="process-step relative transition-all duration-700 bg-white shadow-md p-8 hover:shadow-none hover:duration-3 rounded-2xl "
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
					<p class="mb-2 font-medium text-lg text-[#17200f]/25">{String(i + 1).padStart(2, '0')}</p>
					<h3 class="font-medium text-xl text-[#17200f]">{p.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-[#17200f]/55">{p.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- FAQ -->
<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-3xl">
		<div class="text-center">
			<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm">
				Common Questions
			</span>
			<h2 class="font-bold mt-5 text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl">
				Before you hit submit.
			</h2>
		</div>

		<div class="mt-12 divide-y divide-black/10 border-y border-black/10">
			{#each faqs as faq, i (faq.q)}
				<div>
					<button
						type="button"
						onclick={() => (openFaq = openFaq === i ? null : i)}
						aria-expanded={openFaq === i}
						class="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:bg-black/[0.02]"
					>
						<span class="font-medium text-lg text-[#17200f]">{faq.q}</span>
						<ChevronDown
							class="h-5 w-5 flex-shrink-0 text-[#17200f]/40 transition-transform duration-300 {openFaq === i ? 'rotate-180' : ''}"
							aria-hidden="true"
						/>
					</button>
					<div
						class="grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {openFaq === i
							? 'grid-rows-[1fr] pb-6 opacity-100'
							: 'grid-rows-[0fr] opacity-0'}"
					>
						<div class="min-h-0 overflow-hidden pr-8">
							<p class="max-w-xl text-[15px] leading-relaxed text-[#17200f]/60">{faq.a}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>