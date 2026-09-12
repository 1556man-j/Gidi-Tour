<script lang="ts">
	import { onMount } from 'svelte';
	import CTABanner from '../../components/CTABanner.svelte';
	import { urlFor } from '$lib/sanity/client';
	import SeoHead from '../../components/SeoHead.svelte';
	import type { PageData } from './$types';
	import {
		Clock3,
		ArrowUpRight,
		Search,
		FileCheck,
		Backpack,
		Coins,
		Languages,
		CloudSun,
		Plug,
		Wifi,
		ShieldCheck,
		Bus,
		Handshake,
		ChevronDown,
		Sun,
		CloudRain,
		Sunrise,
		CheckCircle2
	} from 'lucide-svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	const categories = ['Guide', 'Food', 'Culture', 'Tips', 'Story'] as const;
	type Category = (typeof categories)[number];
	const categoryColor: Record<string, string> = {
		Guide: '#5C9B19',
		Food: '#F98315',
		Culture: '#17200f',
		Tips: '#3B82F6',
		Story: '#A855F7'
	};

	let activeCategory = $state<Category | 'All'>('All');
	let query = $state('');

	const articles = $derived(data.sanityArticles ?? []);
	const featured = $derived(articles.find((a) => a.featured) ?? articles[0]);
	const rest = $derived(
		featured ? articles.filter((a) => a.slug.current !== featured.slug.current) : []
	);

	const filtered = $derived(
		rest.filter((a) => {
			const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
			const matchesQuery =
				query.trim() === '' ||
				a.title.toLowerCase().includes(query.toLowerCase()) ||
				(a.destination ?? '').toLowerCase().includes(query.toLowerCase());
			return matchesCategory && matchesQuery;
		})
	);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	let visibleCards = $state<Set<string>>(new Set());

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const slug = (entry.target as HTMLElement).dataset.slug!;
						visibleCards = new Set([...visibleCards, slug]);
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.15 }
		);

		const reobserve = () => {
			document.querySelectorAll('.journal-card').forEach((el) => observer.observe(el));
		};
		reobserve();

		const mo = new MutationObserver(reobserve);
		const grid = document.querySelector('.journal-grid');
		if (grid) mo.observe(grid, { childList: true });

		return () => {
			observer.disconnect();
			mo.disconnect();
		};
	});

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'Blog',
		name: 'Gidi Tour Travel Journal',
		url: 'https://www.giditour.com/stories',
		description:
			'Travel guides, destination stories, food guides and practical tips from Gidi Tour, covering Nigeria, Ghana, Kenya, Tanzania, Rwanda and beyond.',
		blogPost: articles.map((a) => ({
			'@type': 'BlogPosting',
			headline: a.title,
			description: a.excerpt,
			url: `https://www.giditour.com/stories/${a.slug.current}`,
			image: a.image ? urlFor(a.image).width(1200).url() : undefined,
			datePublished: a.date,
			about: a.destination
		}))
	});

	// ---------- BEFORE YOU GO ----------
	type BeforeYouGoItem = { icon: any; title: string; body: string };

	const beforeYouGo: BeforeYouGoItem[] = [
		{
			icon: FileCheck,
			title: 'Visa Information',
			body: 'Requirements vary a lot by nationality and destination \u2014 some Gidi routes offer visa-on-arrival, others need paperwork weeks ahead. We send a country-specific visa checklist as soon as you book, so nothing gets left to the last week.'
		},
		{
			icon: Backpack,
			title: 'What to Pack',
			body: 'Layers over volume. Most of our routes swing between hot afternoons and cool evenings, so a light jacket earns its space more than a fourth pair of shoes. We\u2019ll send a destination-specific packing list once your dates are confirmed.'
		},
		{
			icon: Coins,
			title: 'Currency',
			body: 'Carry a mix of local currency (small bills for markets and taxis) and one backup card. ATMs are reliable in city centers across most Gidi destinations, less so once you\u2019re outside them \u2014 we\u2019ll flag exactly where to withdraw before you leave the airport.'
		},
		{
			icon: Languages,
			title: 'Language',
			body: 'English gets you further than you\u2019d think across our routes, but a handful of greetings in the local language changes how people treat you \u2014 genuinely. Every itinerary comes with a short phrase sheet for exactly this.'
		},
		{
			icon: CloudSun,
			title: 'Weather',
			body: 'Africa isn\u2019t one climate \u2014 Cairo in July and Kigali in July are not the same trip. See "When to Go" below for destination-specific seasons, or ask us directly when you\u2019re booking.'
		},
		{
			icon: Plug,
			title: 'Electricity',
			body: 'Plug types differ by country \u2014 mostly Type G (UK-style) or Type C/E (EU-style) across our routes. A universal adapter covers all of them; we note the exact type for your destination in your pre-trip pack.'
		},
		{
			icon: Wifi,
			title: 'Internet & SIM Cards',
			body: 'Local SIMs are cheap and easy to grab at the airport in every city we run \u2014 we\u2019ll point you to the right kiosk before you land. Data coverage is solid in cities, patchier in more remote stops, which we flag ahead of time.'
		},
		{
			icon: ShieldCheck,
			title: 'Safety Basics',
			body: 'Standard city-travel sense applies almost everywhere: know where your valuables are, agree on transport before you need it, keep a copy of your documents separate from the originals. Nothing exotic \u2014 just don\u2019t skip it because you\u2019re excited.'
		},
		{
			icon: Bus,
			title: 'Transportation',
			body: 'We arrange transfers between the stops that matter, but getting around a city day-to-day \u2014 rideshare apps, licensed taxis, walking where it\u2019s genuinely walkable \u2014 varies by destination. We brief you on what actually works locally, not what a generic guide says.'
		},
		{
			icon: Handshake,
			title: 'Cultural Etiquette',
			body: 'Small things carry weight \u2014 how you greet an elder, what to wear at a market versus a mosque, whether tipping is expected or a little insulting. We cover the specifics for your destination so you\u2019re not guessing in the moment.'
		}
	];

	let openIndex = $state<number | null>(0);
	function toggle(i: number) {
		openIndex = openIndex === i ? null : i;
	}

	// ---------- TRAVEL TIPS ----------
	const travelTips = [
		'Book internal transport (flights, transfers) at least 3 weeks out \u2014 prices on East African routes especially climb fast closer to departure.',
		'Keep a digital and printed copy of your passport, visa, and vaccination card in separate bags, not just your phone.',
		'Learn the local greeting before you learn anything else \u2014 it opens more doors than any phrase after it.',
		'Carry small denominations for markets and taxis; breaking a large note is harder than you\u2019d expect outside malls and hotels.',
		'Ask your guide before photographing people directly, especially in markets and religious sites \u2014 it\u2019s a courtesy, not a rule everywhere, but it\u2019s never wrong.',
		'Pack one outfit that can handle a formal or religious setting, even on a casual trip \u2014 you\u2019ll likely need it once.'
	];

	// ---------- WHEN TO GO ----------
	type SeasonGuide = {
		destination: string;
		summary: string;
		bestMonths: string;
		avoidMonths: string;
		note: string;
	};

	const seasonGuides: SeasonGuide[] = [
		{
			destination: 'Tanzania',
			summary: 'Best Time to Visit Tanzania',
			bestMonths: 'Jun \u2013 Oct',
			avoidMonths: 'Mar \u2013 May (long rains)',
			note: 'The dry season lines up with peak wildlife viewing in the northern circuit, and Zanzibar\u2019s beaches are at their calmest. The long rains (March\u2013May) aren\u2019t a dealbreaker for a coastal trip, but they make safari roads genuinely difficult.'
		},
		{
			destination: 'Morocco',
			summary: 'When to Visit Morocco',
			bestMonths: 'Mar \u2013 May, Sep \u2013 Nov',
			avoidMonths: 'Jul \u2013 Aug (peak heat)',
			note: 'Spring and autumn hit the sweet spot \u2014 warm days, cool desert nights, and Marrakech hasn\u2019t yet hit its brutal midsummer highs. July and August are genuinely punishing if you\u2019re heading toward the Sahara.'
		},
		{
			destination: 'Nigeria',
			summary: 'Dry vs Rainy Season in Nigeria',
			bestMonths: 'Nov \u2013 Feb (dry, Harmattan)',
			avoidMonths: 'Jun \u2013 Sep (peak rains)',
			note: 'The dry season brings the Harmattan haze but far easier travel between cities. The rainy season (roughly April\u2013October, heaviest June\u2013September) can slow road transport considerably, especially outside Lagos.'
		},
		{
			destination: 'Kenya',
			summary: 'Best Time for a Kenya Safari',
			bestMonths: 'Jul \u2013 Oct',
			avoidMonths: 'Apr \u2013 May (long rains)',
			note: 'July through October covers the Great Migration river crossings in the Mara and the driest, easiest game viewing overall. April\u2013May rains are heavy enough to close some park roads entirely.'
		}
	];

	let activeSeason = $state(0);

	// ---------- BUDGET & MONEY ----------
	type BudgetTier = { tier: string; range: string; covers: string };

	const budgetTiers: BudgetTier[] = [
		{
			tier: 'Backpacker',
			range: '$40\u2013$70 / day',
			covers:
				'Hostel or budget guesthouse, local street food and market meals, shared or public transport, free/low-cost sights.'
		},
		{
			tier: 'Mid-range',
			range: '$100\u2013$180 / day',
			covers:
				'Comfortable 3\u2013star hotels, a mix of local and sit-down restaurants, private transfers for longer legs, paid tours and activities.'
		},
		{
			tier: 'Comfort',
			range: '$220+ / day',
			covers:
				'Boutique or 4\u2013star stays, private guides, domestic flights over long road transfers, curated experiences with smaller groups.'
		}
	];

	const moneyTips = [
		'Card payments are common in city hotels and malls, but markets, taxis and smaller towns are cash-first almost everywhere on our routes.',
		'Notify your bank before you travel \u2014 a surprising number of card declines abroad are just fraud flags, not actual problems.',
		'Budget 10\u201315% above your estimate for the trip you didn\u2019t plan for \u2014 the detour, the extra night, the thing you didn\u2019t know you\u2019d want.',
		'Tipping norms vary by country; we include a quick tipping guide in every pre-trip pack so you\u2019re not guessing at the table.'
	];
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/stories"
	siteName={data.siteSettings?.siteName}
/>

<!-- INTRO -->
<section class="relative overflow-hidden bg-[#f7f3ea] px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-24">
	<div
		class="pointer-events-none absolute inset-x-0 top-[-10%] h-[50%] bg-[radial-gradient(55%_60%_at_25%_0%,rgba(92,155,25,0.1),transparent_70%)]"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-360">
		<div class="max-w-3xl translate-y-0 animate-fade-up opacity-0 [animation-delay:0ms]">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
			>
				Travel Journal
			</span>
			<h1
				class="font-display mt-5 text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
			>
				Notes from the road,<br />not the search results.
			</h1>
			<p class="mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
				Guides, stories, food finds and honest tips from the places we actually send travelers to.
				Written by people who have been, for people who are about to go.
			</p>
		</div>

		<!-- Search + filters -->
		<div
			class="mt-10 flex translate-y-0 flex-col gap-4 opacity-0 [animation-delay:120ms] animate-fade-up sm:flex-row sm:items-center sm:justify-between"
		>
			<div
				class="flex items-center gap-2 overflow-x-auto scrollbar-none [&::-webkit-scrollbar]:hidden"
			>
				<button
					type="button"
					class="shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 {activeCategory ===
					'All'
						? 'border-[#17200f] bg-[#17200f] text-white'
						: 'border-black/10 bg-white text-[#17200f]/55 hover:border-[#5C9B19]/40 hover:text-[#17200f]'}"
					onclick={() => (activeCategory = 'All')}
				>
					All stories
				</button>
				{#each categories as category (category)}
					<button
						type="button"
						class="shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition-all duration-200 {activeCategory ===
						category
							? 'border-[#17200f] bg-[#17200f] text-white'
							: 'border-black/10 bg-white text-[#17200f]/55 hover:border-[#5C9B19]/40 hover:text-[#17200f]'}"
						onclick={() => (activeCategory = category)}
					>
						{category}
					</button>
				{/each}
			</div>

			<label class="relative flex w-full items-center sm:w-64">
				<Search
					class="pointer-events-none absolute left-3.5 h-4 w-4 text-[#17200f]/35"
					aria-hidden="true"
				/>
				<input
					type="search"
					bind:value={query}
					placeholder="Search a destination..."
					class="w-full rounded-full border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-[#17200f] placeholder:text-[#17200f]/35 outline-none transition focus:border-[#5C9B19]"
				/>
			</label>
		</div>
	</div>
</section>

<!-- FEATURED -->
{#if featured}
	<section
		class="translate-y-0 bg-[#f7f3ea] px-5 pb-16 opacity-0 [animation-delay:220ms] animate-fade-up sm:px-8 lg:px-12"
	>
		<div class="mx-auto max-w-360">
			<a
				href={`/stories/${featured.slug.current}`}
				class="group grid gap-0 overflow-hidden rounded-[28px] shadow-[0_30px_60px_-25px_rgba(23,32,15,0.35)] lg:grid-cols-2"
			>
				<div class="relative aspect-16/10 overflow-hidden lg:aspect-auto">
					{#if featured.image}
						<img
							src={urlFor(featured.image).width(1200).height(800).url()}
							alt={featured.title}
							class="absolute inset-0 h-full w-full object-cover transition-transform duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
							loading="eager"
						/>
					{/if}
				</div>
				<div class="flex flex-col justify-center bg-[#17200f] p-8 text-white sm:p-12">
					<span
						class="mb-4 inline-flex w-fit items-center rounded-full bg-white/10 px-3 py-1 text-[14px] font-bold capitalize text-[#F98315]"
					>
						Featured {featured.category}
					</span>
					<h2 class="font-display text-3xl leading-tight tracking-[-.02em] sm:text-4xl">
						{featured.title}
					</h2>
					<p class="mt-4 max-w-md text-[15px] leading-relaxed text-white/60">{featured.excerpt}</p>
					<div class="mt-6 flex items-center gap-4 text-xs text-white/40">
						{#if featured.destination}
							<span>{featured.destination}</span>
							<span class="h-1 w-1 rounded-full bg-white/30"></span>
						{/if}
						{#if featured.readTime}
							<span class="flex items-center gap-1">
								<Clock3 class="h-3.5 w-3.5" aria-hidden="true" />{featured.readTime} min read
							</span>
						{/if}
					</div>
					<span class="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-[#F98315]">
						Read the story
						<ArrowUpRight
							class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
							aria-hidden="true"
						/>
					</span>
				</div>
			</a>
		</div>
	</section>
{/if}

<!-- GRID -->
<section class="bg-[#f7f3ea] px-5 pb-10 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-[1440px]">
		<div class="journal-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as article (article.slug.current)}
				<a
					href={`/stories/${article.slug.current}`}
					data-slug={article.slug.current}
					class="journal-card group relative translate-y-7 overflow-hidden rounded-[22px] bg-white opacity-0 shadow-sm transition-all duration-700 hover:shadow-[0_24px_48px_-24px_rgba(23,32,15,0.25)] {visibleCards.has(
						article.slug.current
					)
						? 'translate-y-0! opacity-100!'
						: ''}"
				>
					<div class="relative aspect-4/3 overflow-hidden">
						{#if article.image}
							<img
								src={urlFor(article.image).width(1200).height(800).url()}
								alt={article.title}
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
								loading="lazy"
							/>
						{/if}
						<span
							class="absolute left-4 top-4 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white shadow"
							style="background-color: {categoryColor[article.category] ?? '#5C9B19'};"
						>
							{article.category}
						</span>
					</div>
					<div class="p-5">
						<p class="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17200f]/40">
							{article.destination} \u00b7 {formatDate(article.date)}
						</p>
						<h3 class="font-display text-xl leading-snug text-[#17200f]">{article.title}</h3>
						<p class="mt-2 text-sm leading-relaxed text-[#17200f]/55">{article.excerpt}</p>
						<div class="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
							<span class="flex items-center gap-1.5 text-xs text-[#17200f]/45">
								<Clock3 class="h-3.5 w-3.5" aria-hidden="true" />
								{article.readTime} min read
							</span>
							<span
								class="flex items-center gap-1 text-xs font-bold text-[#5C9B19] transition group-hover:text-[#F98315]"
							>
								Read
								<ArrowUpRight class="h-3.5 w-3.5" aria-hidden="true" />
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		{#if filtered.length === 0}
			<p class="py-16 text-center text-sm text-[#17200f]/50">
				Nothing matches "{query}" yet, try another destination or category.
			</p>
		{/if}
	</div>
</section>

<!-- BEFORE YOU GO -->
<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="max-w-2xl">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
			>
				Before You Go
			</span>
			<h2
				class="font-bold mt-5 text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl"
			>
				Everything you're<br />quietly wondering about.
			</h2>
			<p class="mt-5 text-lg leading-relaxed text-[#17200f]/70">
				The questions everyone has before a trip and rarely asks out loud. Answered once, here.
			</p>
		</div>

		<div class="mt-12 max-w-[740px] divide-y divide-black/10 border-y border-black/10">
			{#each beforeYouGo as item, i (item.title)}
				{@const Icon = item.icon}
				<div>
					<button
						type="button"
						onclick={() => toggle(i)}
						aria-expanded={openIndex === i}
						class="flex w-full items-center gap-4 py-5 text-left transition hover:bg-black/[0.02] sm:gap-5 sm:py-6"
					>
						<span
							class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#5C9B19]/10 sm:h-12 sm:w-12"
						>
							<Icon class="h-5 w-5 text-[#5C9B19]" aria-hidden="true" />
						</span>
						<span class="flex-1 font-medium text-lg text-[#17200f] sm:text-xl">{item.title}</span>
						<ChevronDown
							class="h-5 w-5 flex-shrink-0 text-[#17200f]/70 transition-transform duration-300 {openIndex ===
							i
								? 'rotate-180'
								: ''}"
							aria-hidden="true"
						/>
					</button>
					<div
						class="grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {openIndex ===
						i
							? 'grid-rows-[1fr] pb-6 opacity-100'
							: 'grid-rows-[0fr] opacity-0'}"
					>
						<div class="min-h-0 overflow-hidden pl-14 pr-4 sm:pl-[68px] sm:pr-10">
							<p class="max-w-xl text-[15px] leading-relaxed text-[#17200f]/76">{item.body}</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- TRAVEL TIPS -->
<section class="bg-[#fff] px-5 rounded-4xl py-20 text-black sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="grid gap-10 lg:grid-cols-12 lg:items-stretch">
			<div class="lg:col-span-4 w-full">
				<div class="h-[300px] sm:h-[400px] md:h-[450px] lg:h-full lg:min-h-[500px]">
					<img
						src="images/hero/travel-tip.jpg"
						alt="Travel Tips"
						class="block w-full h-full rounded-2xl object-cover object-center"
					/>
				</div>
			</div>

			<div class="lg:col-span-7 lg:col-start-6">
				<div>
					<span
						class="inline-flex rounded-full bg-black/10 px-4 py-1.5 text-[17px] font-bold capitalize text-[#F98315]"
					>
						Travel Tips
					</span>

					<h2 class="mt-5 text-4xl font-bold leading-[1.05] tracking-[-.03em] sm:text-5xl">
						Small things that<br /> save a whole trip.
					</h2>

					<p class="mt-5 max-w-sm text-black/75">
						Nothing dramatic, just the details that separate a smooth trip from a stressful one.
					</p>
				</div>

				<ul>
					{#each travelTips as tip, i (tip)}
						<li class="flex gap-4 border-b border-white/10 py-5 first:pt-0 last:border-0">
							<CheckCircle2
								class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#5C9B19]"
								aria-hidden="true"
							/>
							<p class="text-[15px] leading-relaxed text-black/79">{tip}</p>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</section>

<!-- WHEN TO GO -->
<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="max-w-2xl">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
			>
				When to Go
			</span>
			<h2
				class="font-bold mt-5 text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl"
			>
				Timing matters more<br />than people admit.
			</h2>
			<p class="mt-5 text-lg leading-relaxed text-[#17200f]/70">
				Same destination, different month, completely different trip. Here's the honest breakdown.
			</p>
		</div>

		<!-- Destination tabs -->
		<div class="no-scrollbar mt-10 flex gap-2 overflow-x-auto border-b border-black/10 pb-px">
			{#each seasonGuides as guide, i (guide.destination)}
				<button
					type="button"
					onclick={() => (activeSeason = i)}
					class="relative flex-shrink-0 px-4 py-3 text-sm font-bold transition-colors {activeSeason ===
					i
						? 'text-[#17200f]'
						: 'text-[#17200f]/40 hover:text-[#17200f]/70'}"
				>
					{guide.destination}
					{#if activeSeason === i}
						<span class="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-[#F98315]"></span>
					{/if}
				</button>
			{/each}
		</div>

		<!-- Active season panel -->
		{#key activeSeason}
			<div class="mt-8 grid gap-8 rounded-[26px] bg-white p-8 shadow-sm sm:p-10 lg:grid-cols-12">
				<div class="lg:col-span-7">
					<h3 class="font-display text-2xl text-[#17200f] sm:text-3xl">
						{seasonGuides[activeSeason].summary}
					</h3>
					<p class="mt-4 max-w-xl text-[15px] leading-relaxed text-[#17200f]/60">
						{seasonGuides[activeSeason].note}
					</p>
				</div>
				<div class="flex flex-col justify-center gap-4 lg:col-span-5 lg:col-start-8">
					<div class="flex items-center gap-3 rounded-2xl bg-[#5C9B19]/10 p-4">
						<Sun class="h-5 w-5 flex-shrink-0 text-[#5C9B19]" aria-hidden="true" />
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]">
								Best months
							</p>
							<p class="mt-0.5 text-sm font-semibold text-[#17200f]">
								{seasonGuides[activeSeason].bestMonths}
							</p>
						</div>
					</div>
					<div class="flex items-center gap-3 rounded-2xl bg-[#F98315]/10 p-4">
						<CloudRain class="h-5 w-5 flex-shrink-0 text-[#F98315]" aria-hidden="true" />
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#F98315]">
								Best avoided
							</p>
							<p class="mt-0.5 text-sm font-semibold text-[#17200f]">
								{seasonGuides[activeSeason].avoidMonths}
							</p>
						</div>
					</div>
				</div>
			</div>
		{/key}
	</div>
</section>

<!-- BUDGET & MONEY -->
<!-- <section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-[1440px]">
		<div class="max-w-2xl">
			<span
				class="inline-flex rounded-full bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-[#5C9B19] shadow-sm"
			>
				Budget & Money
			</span>
			<h2
				class="font-display mt-5 text-4xl leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl"
			>
				What a trip<br />actually costs.
			</h2>
			<p class="mt-5 text-lg leading-relaxed text-[#17200f]/60">
				Rough daily ranges, not a quote \u2014 real costs depend on route, season and how you like
				to travel.
			</p>
		</div>

		<div class="mt-12 grid gap-5 lg:grid-cols-3">
			{#each budgetTiers as tier, i (tier.tier)}
				<div
					class="rounded-[24px] border p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl {i ===
					1
						? 'border-[#5C9B19] bg-[#17200f] text-white shadow-lg'
						: 'border-black/10 bg-white text-[#17200f]'}"
				>
					{#if i === 1}
						<span
							class="mb-4 inline-flex rounded-full bg-[#5C9B19] px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-white"
						>
							Most common
						</span>
					{/if}
					<p class="font-display text-2xl {i === 1 ? 'text-white' : 'text-[#17200f]'}">
						{tier.tier}
					</p>
					<p class="mt-1 text-2xl font-bold {i === 1 ? 'text-[#F98315]' : 'text-[#5C9B19]'}">
						{tier.range}
					</p>
					<p class="mt-4 text-sm leading-relaxed {i === 1 ? 'text-white/60' : 'text-[#17200f]/55'}">
						{tier.covers}
					</p>
				</div>
			{/each}
		</div>

		<div class="mt-14 grid gap-6 border-t border-black/10 pt-12 sm:grid-cols-2">
			{#each moneyTips as tip (tip)}
				<div class="flex gap-3">
					<Coins class="mt-0.5 h-5 w-5 flex-shrink-0 text-[#F98315]" aria-hidden="true" />
					<p class="text-sm leading-relaxed text-[#17200f]/65">{tip}</p>
				</div>
			{/each}
		</div>
	</div>
</section> -->

<!-- CTA Banner -->
<CTABanner />
