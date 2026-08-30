<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
    import { Download, BookOpen, Users, TrendingUp } from 'lucide-svelte';

	const identity: {
		number: string;
		label: string;
		value: string;
	}[] = [
		{
			number: '01',
			label: 'Our Vision',
			value:
				'A world where travel brings people closer together, helping every traveler discover new places through culture, connection, food and unforgettable experiences.'
		},
		{
			number: '02',
			label: 'Our Mission',
			value:
				'To create thoughtful travel experiences that go beyond sightseeing and connect travelers with the people, stories, culture and everyday life that make each destination unique.'
		}
	];
</script>

<svelte:head>
	<title>About Gidi Tour - Travel Beyond the Ordinary</title>

	<meta
		name="description"
		content="Learn about Gidi Tour, a travel company creating authentic experiences that connect travelers with local culture, food, people, history and everyday life across Africa and beyond."
	/>

	<meta
		name="keywords"
		content="Gidi Tour, African travel experiences, cultural tours, authentic travel, Nigeria tours, Ghana tours, Kenya tours, Tanzania tours, Rwanda tours, travel experiences"
	/>

	<meta name="robots" content="index, follow" />

	<link rel="canonical" href="https://www.giditour.com/about" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://www.giditour.com/about" />
	<meta property="og:title" content="About Gidi Tour - Travel Beyond the Ordinary" />
	<meta
		property="og:description"
		content="We create meaningful travel experiences that bring you closer to the culture, people, food and stories that make a place unforgettable."
	/>
	<meta property="og:image" content="https://res.cloudinary.com/du8ocxxu1/image/upload/v1787983116/tour_acdwyc.png" />
	<meta property="og:site_name" content="Gidi Tour" />

	<!-- Twitter / X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="About Gidi Tour - Travel Beyond the Ordinary" />
	<meta
		name="twitter:description"
		content="Discover the story behind Gidi Tour and how we create authentic travel experiences around culture, people, food and local life."
	/>
	<meta name="twitter:image" content="https://res.cloudinary.com/du8ocxxu1/image/upload/v1787983116/tour_acdwyc.png" />

	<!-- AEO / Structured Data -->
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "AboutPage",
			"name": "About Gidi Tour",
			"url": "https://www.giditour.com/about",
			"description": "Learn about Gidi Tour and our approach to creating authentic travel experiences built around culture, people, food, history and local life.",
			"mainEntity": {
				"@type": "TravelAgency",
				"name": "Gidi Tour",
				"url": "https://www.giditour.com",
				"description": "Gidi Tour creates authentic travel experiences that connect travelers with local culture, people, food, history and everyday life.",
				"sameAs": [
					"https://www.instagram.com/",
					"https://www.youtube.com/",
					"https://www.tiktok.com/"
				]
			}
		}
	</script>
</svelte:head>

<!-- Who We Are -->
<section id="who-we-are" class="mx-auto max-w-7xl px-6 py-20 md:py-20" use:reveal>
	<div class="mb-10 max-w-3xl md:mb-14">
		<span
			class="inline-flex rounded-full border border-[#5c9b19]/20 bg-[#5c9b19]/5 px-4 py-2 text-[17px] font-bold uppercase text-[#5c9b19] md:text-xs"
		>
			Who We Are
		</span>

		<h2
			class="mt-5 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#17200f] md:text-5xl lg:text-6xl flex flex-col"
		>
			Travel should feel<span>like coming home,</span>
			<span class="text-[#f98315]"> not just visiting</span>
			<span class="text-[#f98315]"> somewhere new.</span>
		</h2>
	</div>

	<div class="flex flex-col gap-6 md:flex-row">
		{#each identity as card (card.number)}
			<div
				class="group rounded-2xl border border-[#17200f]/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8"
			>
				<div
					class="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#5c9b19]/10 text-xl font-bold text-[#5c9b19]"
				>
					{card.number}
				</div>

				<h3 class="mb-3 text-xl font-bold text-[#17200f] md:text-2xl">
					{card.label}
				</h3>

				<p class="text-[16px] leading-7 text-[#17200f]/65 md:text-lg md:leading-8">
					{card.value}
				</p>
			</div>
		{/each}
	</div>
	<!-- Number -->
	<div class="mx-auto max-w-[1100px]">
		<div
			class="reveal mt-12 bg-white shadow-md grid grid-cols-2 divide-x divide-y divide-black/10 sm:grid-cols-4 sm:divide-y-0"
		>
			<div class="p-6 text-center">
				<p class="font-display text-4xl lg:text-6xl text-[#5C9B19]">09+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Countries where you can discover new places, cultures, flavours, and stories.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-display text-4xl lg:text-6xl text-[#5C9B19]">100+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Curated experiences designed to help you see each destination beyond the usual tourist
					spots.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-display text-4xl lg:text-6xl text-[#5C9B19]">100%</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Local experiences built around the people, culture, food, history, and everyday life of
					each destination.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-display text-4xl lg:text-6xl text-[#F98315]">∞</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Stories, connections, and memories waiting to become part of your journey.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- OUR IMPACT -->
<section
	class="mx-auto bg-[#f7f3ea] px-5 py-12 sm:px-8 md:py-14 lg:px-12"
	use:reveal
>
	<div class="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-2 lg:gap-20">
		<div class="relative order-1 flex items-center justify-center lg:order-2">
			<img src="/images/hero/impact.png" alt="Traveler exploring with Gidi" class="md:w-full" loading="lazy" />
		</div>
		<div class="order-2 lg:order-1">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#5C9B19] shadow-sm"
			>
				Our Impact
			</span>

			<h2 class="font-display mt-4 text-3xl leading-[1.1] font-bold  text-[#17200f] md:text-5xl">
				What <span class="text-[#F98315]">12,000+ travelers</span> <br /> have discovered together.
			</h2>

			<p class="my-6 max-w-lg text-center text-[20px] leading-[1.55] text-black md:text-left max-md:mx-auto">
				Stories, numbers and milestones from a community of travelers going beyond the usual
				highlights. See exactly where we've been — and where we're headed next.
			</p>

			<div class="mt-6 flex flex-wrap items-center gap-6 max-md:justify-center">
				<a
					href="/files/impact-report-2025.pdf"
					class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
				>
					<Download class="h-4 w-4" aria-hidden="true" />
					Download the Report
				</a>
			</div>
		</div>
	</div>
</section>

<!-- OUR MODEL -->
<section use:reveal class="mx-auto px-5 py-20 sm:px-8 md:py-14 lg:px-12">
	<div class="mx-auto mb-6 max-w-[1440px]">
		<div class="max-w-2xl">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#5C9B19] shadow-sm"
			>
				Our Model
			</span>
			<h2 class="font-display mt-4 text-3xl leading-[1.1] font-bold text-[#17200f] md:text-5xl">
				How <span class="text-[#F98315]">Gidi Tour</span> works.
			</h2>
		</div>

		<div class="mt-6 grid gap-6 md:grid-cols-3">
			<!-- Pillar 1 -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
			>
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5C9B19]/10">
					<BookOpen class="h-6 w-6 text-[#5C9B19]" aria-hidden="true" />
				</div>
				<div>
					<p class="mb-2 text-xl font-semibold text-[#17200f]">Local Immersion</p>
					<p class="text-sm leading-[1.5] text-[#17200f]/75 md:text-[18px]">
						We build every trip around the food, culture and people that make a place what it is,
						not just the landmarks everyone else photographs.
					</p>
				</div>
				<span class="mt-auto text-[11px] font-semibold uppercase tracking-widest text-[#17200f]/40">
					Pillar 01
				</span>
			</div>

			<!-- Pillar 2 -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
			>
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#5C9B19]/10">
					<Users class="h-6 w-6 text-[#5C9B19]" aria-hidden="true" />
				</div>
				<div>
					<p class="mb-2 text-xl font-semibold text-[#17200f]">Guides Who Know the Ground</p>
					<p class="text-sm leading-[1.5] text-[#17200f]/75 md:text-[18px]">
						Every experience is led by people from the destination itself, the ones who actually
						know the shortcuts, the stories, and the best time to show up.
					</p>
				</div>
				<span class="mt-auto text-[11px] font-semibold uppercase tracking-widest text-[#17200f]/40">
					Pillar 02
				</span>
			</div>

			<!-- Pillar 3 -->
			<div
				class="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
			>
				<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F98315]/10">
					<TrendingUp class="h-6 w-6 text-[#F98315]" aria-hidden="true" />
				</div>
				<div>
					<p class="mb-2 text-xl font-semibold text-[#17200f]">Trips Built Around You</p>
					<p class="text-sm leading-[1.5] text-[#17200f]/75 md:text-[18px]">
						From first-timers to seasoned travelers, we shape every itinerary around what you're
						actually curious about, not a fixed tourist checklist.
					</p>
				</div>
				<span class="mt-auto text-[11px] font-semibold uppercase tracking-widest text-[#17200f]/40">
					Pillar 03
				</span>
			</div>
		</div>
	</div>
</section>