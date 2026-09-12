<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { fade } from 'svelte/transition';
	import { ArrowUpRight, MapPin, Clock3, Wallet } from 'lucide-svelte';
	import CTABanner from '../../components/CTABanner.svelte';
	import TestimonialBand from '../../components/TestimonialBand.svelte';
	import { onMount } from 'svelte';
	import SeoHead from '../../components/SeoHead.svelte';
	import { urlFor } from '$lib/sanity/client';
	import type { PageData } from './$types';

	// Region filter labels — just UI, kept local rather than derived
	// from Sanity so the filter bar works even before every region
	// has a destination in it.
	const regions = ['West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Europe'] as const;
	type Region = (typeof regions)[number];

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const countries = $derived(data.sanityDestinations ?? []);

	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	let activeRegion = $state<Region | 'All'>('All');

	const filtered = $derived(
		activeRegion === 'All' ? countries : countries.filter((c) => c.region === activeRegion)
	);

	type Reason = {
		icon: 'map' | 'clock' | 'shield' | 'heart';
		title: string;
		copy: string;
		stat: { value: number; suffix: string; label: string };
	};

	const reasons: Reason[] = [
		{
			icon: 'map',
			title: 'We\u2019ve actually been there',
			copy: 'Every route is walked first by someone on our team not scraped off a "top 10" listicle written by someone who\u2019s never left their desk.',
			stat: { value: 9, suffix: '', label: 'countries, walked not googled' }
		},
		{
			icon: 'clock',
			title: 'Google can\u2019t book you a table',
			copy: 'Search gives you options. We give you the reservation, the guide, the rie, and the backup plan when the first place is closed for a wedding.',
			stat: { value: 14, suffix: 'hrs', label: 'average planning time saved' }
		},
		{
			icon: 'shield',
			title: 'Someone\u2019s got your back',
			copy: 'When a flight gets cancelled at 11pm in a city you\u2019ve never been to, you want a real number to call not a forum thread from 2019.',
			stat: { value: 24, suffix: '/7', label: 'a human, not a chatbot' }
		},
		{
			icon: 'heart',
			title: 'The good stuff isn\u2019t indexed',
			copy: 'The best meal you\u2019ll have won\u2019t show up in search results. It\u2019s at someone\u2019s aunt\u2019s place, and you only get invited if you know someone who knows someone.',
			stat: { value: 100, suffix: '%', label: 'local, not algorithmic' }
		}
	];

	let visible = $state<boolean[]>(reasons.map(() => false));
	let counts = $state<number[]>(reasons.map(() => 0));
	let strikeVisible = $state(false);

	function animateCount(i: number, target: number) {
		const duration = 900;
		const start = performance.now();
		function tick(now: number) {
			const progress = Math.min((now - start) / duration, 1);
			const eased = 1 - Math.pow(1 - progress, 3);
			counts[i] = Math.round(eased * target);
			counts = [...counts];
			if (progress < 1) requestAnimationFrame(tick);
		}
		requestAnimationFrame(tick);
	}

	type Beat = {
		city: string;
		line: string;
		image: string;
	};

	const beats: Beat[] = [
		{
			city: 'Lagos',
			line: 'Lagos moves to its own rhythm; loud, fast, and never quite asleep.',
			image: 'https://images.unsplash.com/photo-1618828665011-0abd973f7bb8?auto=format&fit=crop&w=1600&q=80'
		},
		{
			city: 'Accra',
			line: 'Accra carries its history in layers; colonial forts, kente cloth, and a coastline that remembers everything.',
			image: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?auto=format&fit=crop&w=1600&q=80'
		},
		{
			city: 'Zanzibar',
			line: 'Tanzania opens a door; wildlife on one side, spice-scented coastline on the other.',
			image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=80'
		},
		{
			city: 'London',
			line: 'London has stories that go far beyond the landmarks everyone already knows by heart.',
			image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80'
		}
	];

	let activeIndex = $state(0);

	onMount(() => {
		const cardObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					const i = Number((entry.target as HTMLElement).dataset.index);
					if (visible[i]) return;
					visible[i] = true;
					visible = [...visible];
					animateCount(i, reasons[i].stat.value);
					cardObserver.unobserve(entry.target);
				});
			},
			{ threshold: 0.35 }
		);
		document.querySelectorAll('.reason-card').forEach((el) => cardObserver.observe(el));

		const strikeObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						strikeVisible = true;
						strikeObserver.disconnect();
					}
				});
			},
			{ threshold: 0.6 }
		);
		const strikeEl = document.querySelector('.strike-target');
		if (strikeEl) strikeObserver.observe(strikeEl);

		const beatObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const i = Number((entry.target as HTMLElement).dataset.beat);
						activeIndex = i;
					}
				});
			},
			{
				rootMargin: '-45% 0px -45% 0px',
				threshold: 0
			}
		);
		document.querySelectorAll('.story-beat').forEach((el) => beatObserver.observe(el));

		return () => {
			cardObserver.disconnect();
			strikeObserver.disconnect();
			beatObserver.disconnect();
		};
	});
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/destinations"
	siteName={data.siteSettings?.siteName}
/>

<!-- INTRO -->
<section class="bg-[#f7f3ea] px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24" use:reveal>
	<div class="mx-auto max-w-[1440px]">
		<div class="max-w-3xl">
			<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#5C9B19] shadow-sm">
				Destinations
			</span>
			<h1 class="font-display mt-5 text-4xl leading-[1.05] tracking-[-.03em] font-bold text-[#17200f] sm:text-5xl lg:text-6xl">
				Countries we know well<br /> <span class="text-[#f98315]">enough</span> to send you.
			</h1>
			<p class="mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/75">
				Every country here has more than one city worth your time. Pick a country, then pick
				where in it you want to go.
			</p>
		</div>

		<!-- Filter bar -->
		<div class="no-scrollbar mt-10 flex items-center gap-2 overflow-x-auto border-b border-black/10 pb-5">
			<button type="button" class="filter-pill" class:filter-pill--active={activeRegion === 'All'} onclick={() => (activeRegion = 'All')}>
				All
				<span class="filter-pill__count">{countries.length}</span>
			</button>
			{#each regions as region (region)}
				<button type="button" class="filter-pill" class:filter-pill--active={activeRegion === region} onclick={() => (activeRegion = region)}>
					{region}
					<span class="filter-pill__count">{countries.filter((c) => c.region === region).length}</span>
				</button>
			{/each}
		</div>
	</div>
</section>

<!-- INDEX -->
<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-360">
		{#each filtered as country, i (country.slug.current)}
			<a
				href={`/destinations/${country.slug.current}`}
				class="dest-row group grid grid-cols-1 items-center gap-8 border-b border-black/10 py-10 first:pt-0 lg:grid-cols-12 lg:gap-6 lg:py-14"
				class:lg:direction-reverse={i % 2 === 1}
				in:fade={{ duration: 200 }}
			>
				<!-- Index number -->
				<div class="hidden lg:col-span-1 lg:block" class:lg:order-1={i % 2 === 1}>
					<span class="font-display text-2xl text-[#17200f]/20">{String(i + 1).padStart(2, '0')}</span>
				</div>

				<!-- Text -->
				<div class="lg:col-span-6" class:lg:order-2={i % 2 === 1}>
					<div class="mb-3 flex items-center gap-2 lg:hidden">
						<span class="font-display text-lg text-[#17200f]/30">{String(i + 1).padStart(2, '0')}</span>
					</div>

					<p class="mb-2 text-[14px] font-bold uppercase tracking-widest text-[#F98315]">
						{country.region} - {country.cities?.length ?? 0} cities
					</p>

					<h2 class="font-display text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl">
						{country.name}
					</h2>

					<p class="mt-4 max-w-md text-[15px] leading-relaxed text-[#17200f]/60">
						{country.intro}
					</p>

					<!-- City chips -->
					{#if country.cities?.length}
						<div class="mt-5 flex flex-wrap gap-1.5">
							{#each country.cities.slice(0, 4) as city (city.name)}
								<span class="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[#17200f]/60">
									{city.name}
								</span>
							{/each}
							{#if country.cities.length > 4}
								<span class="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-[#17200f]/40">
									+{country.cities.length - 4} more
								</span>
							{/if}
						</div>
					{/if}

					<div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-[#17200f]/50">
						<span class="flex items-center gap-1.5"><MapPin class="h-3.5 w-3.5" aria-hidden="true" />Best {country.bestTime}</span>
						<span class="flex items-center gap-1.5"><Clock3 class="h-3.5 w-3.5" aria-hidden="true" />{country.duration}</span>
						<span class="flex items-center gap-1.5"><Wallet class="h-3.5 w-3.5" aria-hidden="true" />From {country.priceFrom}</span>
					</div>

					<span class="dest-row__cta mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#5C9B19] transition group-hover:text-[#F98315]">
						Explore {country.name}
						<ArrowUpRight class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
					</span>
				</div>

				<!-- Image -->
				<div class="lg:col-span-5" class:lg:order-3={i % 2 === 1}>
					<div class="dest-row__frame relative aspect-[4/3] overflow-hidden rounded-[20px]">
						{#if country.heroImage}
							<img
								src={urlFor(country.heroImage).width(700).height(525).url()}
								alt={country.name}
								class="dest-row__img absolute inset-0 h-full w-full object-cover"
								loading="lazy"
							/>
						{/if}
					</div>
				</div>
			</a>
		{/each}

		{#if filtered.length === 0}
			<p class="py-16 text-center text-sm text-[#17200f]/50">Nothing in this region yet — check back soon.</p>
		{/if}
	</div>
</section>

<!-- WHY EXPLORE WITH US -->
<section class="overflow-hidden px-5 py-20 text-black sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="reveal mb-16 max-w-2xl">
			<p class="text-[17px] font-bold capitalize text-[#F98315]">Fair question</p>
			<h2 class="font-bold mt-3 text-4xl leading-[1.05] tracking-[-.03em] sm:text-5xl lg:text-6xl">
				Why not just <span class="strike-wrap relative inline-block strike-target">
					Google it yourself
					<svg
						class="strike-svg pointer-events-none absolute inset-0 h-full w-full"
						class:strike-svg--drawn={strikeVisible}
						viewBox="0 0 100 20"
						preserveAspectRatio="none"
						aria-hidden="true"
					>
						<line x1="1" y1="14" x2="99" y2="6" stroke="#F98315" stroke-width="1.6" vector-effect="non-scaling-stroke" />
					</svg>
				</span>?
			</h2>
			<p class="mt-6 text-lg leading-relaxed text-black/75">
				You could. People do. Here's what you'd be trading away.
			</p>
		</div>

		<div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
			{#each reasons as reason, i (reason.title)}
				<div
					class="reason-card group relative overflow-hidden rounded-[24px] border border-black/10 bg-white/[0.03] p-6 transition-all duration-700"
					class:reason-card--visible={visible[i]}
					data-index={i}
					style="transition-delay: {i * 90}ms;"
				>
					<div class="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06]">
						{#if reason.icon === 'map'}
							<svg class="icon-draw h-6 w-6" class:icon-draw--on={visible[i]} viewBox="0 0 24 24" fill="none" stroke="#F98315" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
								<line x1="8" y1="2" x2="8" y2="18" />
								<line x1="16" y1="6" x2="16" y2="22" />
							</svg>
						{:else if reason.icon === 'clock'}
							<svg class="icon-draw h-6 w-6" class:icon-draw--on={visible[i]} viewBox="0 0 24 24" fill="none" stroke="#F98315" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<circle cx="12" cy="12" r="10" />
								<polyline points="12 6 12 12 16 14" />
							</svg>
						{:else if reason.icon === 'shield'}
							<svg class="icon-draw h-6 w-6" class:icon-draw--on={visible[i]} viewBox="0 0 24 24" fill="none" stroke="#F98315" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
							</svg>
						{:else}
							<svg class="icon-draw h-6 w-6" class:icon-draw--on={visible[i]} viewBox="0 0 24 24" fill="none" stroke="#F98315" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
								<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
							</svg>
						{/if}
					</div>

					<h3 class="font-medium  text-xl leading-tight text-black">{reason.title}</h3>
					<p class="mt-3 text-sm  leading-relaxed text-black/75">{reason.copy}</p>

					<div class="mt-6 border-t border-black/10 pt-4">
						<p class="font-display text-3xl text-[#F98315]">
							{counts[i]}{reason.stat.suffix}
						</p>
						<p class="mt-1 text-[11px] uppercase tracking-[.14em] text-black/70">{reason.stat.label}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- EVERY DESTINATION, A DIFFERENT STORY -->
<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">
	<div class="mx-auto max-w-[1440px]">
		<div class="grid gap-12 lg:grid-cols-12">
			<!-- LEFT: sticky image -->
			<div class="lg:col-span-5">
				<div class="lg:sticky lg:top-28">
					<div class="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_30px_60px_-20px_rgba(23,32,15,0.3)]">
						{#each beats as beat, i (beat.city)}
							<img
								src={beat.image}
								alt={beat.city}
								class="story-img absolute inset-0 h-full w-full object-cover"
								class:story-img--active={activeIndex === i}
								loading={i === 0 ? 'eager' : 'lazy'}
							/>
						{/each}
						<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

						<div class="absolute bottom-0 left-0 p-7">
							{#each beats as beat, i (beat.city)}
								<span
									class="story-label absolute bottom-7 left-7 font-display text-3xl text-white"
									class:story-label--active={activeIndex === i}
								>
									{beat.city}
								</span>
							{/each}
						</div>
					</div>

					<!-- Progress dashes, tied to activeIndex -->
					<div class="mt-5 flex gap-2">
						{#each beats as beat, i (beat.city)}
							<span class="h-[3px] flex-1 rounded-full bg-[#17200f]/10">
								<span
									class="block h-full rounded-full bg-[#F98315] transition-all duration-500"
									style="width: {activeIndex >= i ? '100%' : '0%'}"
								></span>
							</span>
						{/each}
					</div>
				</div>
			</div>

			<!-- RIGHT: intro + scrolling beats -->
			<div class="lg:col-span-7 lg:col-start-6">
				<div class="max-w-xl">
					<p class="text-[17px] font-bold capitalize text-[#5C9B19]">
						Not all trips are the same
					</p>
					<h2 class="font-display mt-3 text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl">
						Every destination has<br />a different story.
					</h2>
				</div>

				<div class="mt-16 flex flex-col gap-[38vh] pb-[20vh] lg:gap-[46vh]">
					{#each beats as beat, i (beat.city)}
						<p
							class="story-beat max-w-md text-2xl leading-snug tracking-[-.01em] transition-colors duration-500 sm:text-3xl"
							class:story-beat--active={activeIndex === i}
							data-beat={i}
						>
							{beat.line}
						</p>
					{/each}

					<div class="max-w-md border-t border-black/10 pt-10">
						<p class="text-[20px] leading-relaxed text-[#17200f]/70">
							We don't want you to simply visit a place. We want you to understand what makes it
							worth remembering.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- Testimonial -->
 <TestimonialBand/>

<!-- FINAL CTA -->
<CTABanner />

<style>
	.no-scrollbar {
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}
	.no-scrollbar::-webkit-scrollbar {
		display: none;
	}

	.filter-pill {
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: 6px;
		border-radius: 999px;
		padding: 8px 16px;
		font-size: 13px;
		font-weight: 600;
		color: rgba(23, 32, 15, 0.55);
		background: transparent;
		transition:
			background-color 200ms ease,
			color 200ms ease;
	}
	.filter-pill:hover {
		background: rgba(23, 32, 15, 0.05);
		color: #17200f;
	}
	.filter-pill--active {
		background: #17200f;
		color: #fff;
	}
	.filter-pill--active:hover {
		background: #17200f;
		color: #fff;
	}

	.filter-pill__count {
		font-size: 11px;
		opacity: 0.55;
	}

	.dest-row__frame {
		box-shadow: 0 20px 40px -20px rgba(23, 32, 15, 0.25);
	}
	.dest-row__img {
		transition: transform 700ms cubic-bezier(0.16, 1, 0.3, 1);
	}
	.dest-row:hover .dest-row__img {
		transform: scale(1.06);
	}

	@media (min-width: 1024px) {
		.lg\:direction-reverse {
			direction: rtl;
		}
		.lg\:direction-reverse > * {
			direction: ltr;
		}
	}
    .reason-card {
		transform: translateY(24px);
		opacity: 0;
	}
	.reason-card--visible {
		transform: translateY(0);
		opacity: 1;
	}
	.reason-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(249, 131, 21, 0.3);
	}

	.icon-draw {
		stroke-dasharray: 90;
		stroke-dashoffset: 90;
		transition: stroke-dashoffset 900ms cubic-bezier(0.65, 0, 0.35, 1);
	}
	.icon-draw--on {
		stroke-dashoffset: 0;
		transition-delay: 150ms;
	}

	.strike-svg line {
		stroke-dasharray: 140;
		stroke-dashoffset: 140;
		transition: stroke-dashoffset 700ms cubic-bezier(0.65, 0, 0.35, 1);
	}
	.strike-svg--drawn line {
		stroke-dashoffset: 0;
		transition-delay: 400ms;
	}

	@media (prefers-reduced-motion: reduce) {
		.reason-card,
		.icon-draw,
		.strike-svg line {
			transition: none !important;
			transform: none !important;
			opacity: 1 !important;
			stroke-dashoffset: 0 !important;
		}
	}

    .story-img {
		opacity: 0;
		transform: scale(1.08);
		transition:
			opacity 900ms cubic-bezier(0.65, 0, 0.35, 1),
			transform 1400ms cubic-bezier(0.65, 0, 0.35, 1);
	}
	.story-img--active {
		opacity: 1;
		transform: scale(1);
	}

	.story-label {
		opacity: 0;
		transform: translateY(8px);
		transition:
			opacity 500ms ease,
			transform 500ms ease;
	}
	.story-label--active {
		opacity: 1;
		transform: translateY(0);
		transition-delay: 250ms;
	}

	.story-beat {
		color: rgba(23, 32, 15, 0.25);
	}
	.story-beat--active {
		color: #17200f;
	}

	@media (prefers-reduced-motion: reduce) {
		.story-img,
		.story-label {
			transition: none !important;
		}
	}
</style>