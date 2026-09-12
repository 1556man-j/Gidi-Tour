<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Search, SlidersHorizontal, Star, Clock3, Users, ShieldCheck,
		CreditCard, ArrowRight, MapPin, TrendingUp
	} from 'lucide-svelte';
	import CTABanner from '../../components/CTABanner.svelte';
	import TestimonialBand from '../../components/TestimonialBand.svelte';
	import Article from '../../components/Article.svelte';
	import SeoHead from '../../components/SeoHead.svelte';
	import { urlFor } from '$lib/sanity/client';
	import type { PageData } from './$types';

	// Filter category labels are just UI labels, not content —
	// kept local rather than pulled from Sanity for now.
	const tourCategories = ['City Break', 'Safari', 'Cultural', 'Coastal', 'Adventure', 'Art'] as const;
	type TourCategory = (typeof tourCategories)[number];

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const tours = $derived(data.sanityTours ?? []);

	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	let query = $state('');
	let activeCategory = $state<TourCategory | 'All'>('All');
	let sortBy = $state<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');
	let maxPrice = $state(2000);

	const priceRange = $derived(
		tours.length > 0
			? { min: Math.min(...tours.map((t) => t.price)), max: Math.max(...tours.map((t) => t.price)) }
			: { min: 0, max: 2000 }
	);

	const filtered = $derived(
		tours
			.filter((t) => activeCategory === 'All' || t.category === activeCategory)
			.filter((t) => t.price <= maxPrice)
			.filter(
				(t) =>
					query.trim() === '' ||
					t.title.toLowerCase().includes(query.toLowerCase()) ||
					t.country.toLowerCase().includes(query.toLowerCase())
			)
			.sort((a, b) => {
				if (sortBy === 'price-low') return a.price - b.price;
				if (sortBy === 'price-high') return b.price - a.price;
				if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0);
				return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
			})
	);

	const avgPrice = $derived(
		tours.length > 0 ? Math.round(tours.reduce((sum, t) => sum + t.price, 0) / tours.length) : 0
	);
	const avgRating = $derived(
		tours.length > 0
			? (tours.reduce((sum, t) => sum + (t.rating ?? 0), 0) / tours.length).toFixed(1)
			: '0.0'
	);
	const countryCount = $derived(new Set(tours.map((t) => t.countrySlug)).size);

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
		const reobserve = () => document.querySelectorAll('.tour-card').forEach((el) => observer.observe(el));
		reobserve();
		const mo = new MutationObserver(reobserve);
		const grid = document.querySelector('.tour-grid');
		if (grid) mo.observe(grid, { childList: true });
		return () => {
			observer.disconnect();
			mo.disconnect();
		};
	});
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/tours"
	siteName={data.siteSettings?.siteName}
/>

<!-- HERO -->
<section class="relative overflow-hidden px-5 pb-16 pt-24 text-black sm:px-8 lg:px-12 lg:pt-32">
	<div
		class="pointer-events-none absolute inset-x-0 top-[-10%] h-[60%] bg-[radial-gradient(55%_60%_at_25%_0%,rgba(92,155,25,0.18),transparent_70%)]"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto max-w-360">
		<div class="grid gap-10 lg:grid-cols-12 lg:items-end">
			<div class="lg:col-span-7">
				<span class="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-[17px] font-bold uppercase text-[#F98315]">
					Tours & Packages
				</span>
				<h1 class="font-bold mt-5 text-4xl leading-[1.02] tracking-[-.03em] sm:text-5xl lg:text-6xl">
					Priced routes,<br />ready when you are.
				</h1>
				<p class="mt-5 max-w-lg text-lg leading-relaxed text-black/90">
					{tours.length} tours across countries, each one built by people who've actually
					been. Real prices, real inclusions, book in minutes.
				</p>
			</div>

			<!-- Live stats -->
			<div class="grid grid-cols-3 gap-4 lg:col-span-5 lg:col-start-8">
				<div class="rounded-2xl bg-black/6 p-4">
					<p class="font-bold text-2xl text-black sm:text-3xl">£{avgPrice}</p>
					<p class="mt-1 text-[14px] text-black/75">avg. price / person</p>
				</div>
				<div class="rounded-2xl bg-black/6 p-4">
					<p class="flex items-center gap-1 font-bold text-2xl text-black sm:text-3xl">
						{avgRating}
						<Star class="h-4 w-4 fill-[#F98315] text-[#F98315]" aria-hidden="true" />
					</p>
					<p class="mt-1 text-[14px] text-black/75">average rating</p>
				</div>
				<div class="rounded-2xl bg-black/6 p-4">
					<p class="font-bold text-2xl text-black sm:text-3xl">{countryCount}</p>
					<p class="mt-1 text-[14px] text-black/75">countries covered</p>
				</div>
			</div>
		</div>

		<!-- Search + filter bar -->
		<div class="mt-10 rounded-3xl bg-white p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)] sm:p-5">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
				<label class="relative flex flex-1 items-center">
					<Search class="pointer-events-none absolute left-4 h-4 w-4 text-[#17200f]/35" aria-hidden="true" />
					<input
						type="search"
						bind:value={query}
						placeholder="Search a country or trip..."
						class="w-full rounded-2xl border border-black/10 bg-[#fafafa] py-3.5 pl-11 pr-4 text-sm text-[#17200f] outline-none transition placeholder:text-[#17200f]/35 focus:border-[#5C9B19]"
					/>
				</label>

				<select
					bind:value={sortBy}
					class="cursor-pointer rounded-2xl border border-black/10 bg-[#fafafa] px-4 py-3.5 text-sm font-medium text-[#17200f] outline-none transition focus:border-[#5C9B19]"
				>
					<option value="popular">Most popular</option>
					<option value="price-low">Price: low to high</option>
					<option value="price-high">Price: high to low</option>
					<option value="rating">Highest rated</option>
				</select>
			</div>

			<!-- Category pills -->
			<div class="no-scrollbar mt-4 flex items-center gap-2 overflow-x-auto">
				<button
					type="button"
					onclick={() => (activeCategory = 'All')}
					class="flex-shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition {activeCategory === 'All'
						? 'border-[#17200f] bg-[#17200f] text-white'
						: 'border-black/10 text-[#17200f]/55 hover:border-black/20'}"
				>
					All tours
				</button>
				{#each tourCategories as cat (cat)}
					<button
						type="button"
						onclick={() => (activeCategory = cat)}
						class="flex-shrink-0 rounded-full border px-4 py-2 text-[13px] font-semibold transition {activeCategory === cat
							? 'border-[#17200f] bg-[#17200f] text-white'
							: 'border-black/10 text-[#17200f]/55 hover:border-black/20'}"
					>
						{cat}
					</button>
				{/each}
			</div>

			<!-- Price slider -->
			<div class="mt-4 flex items-center gap-4 border-t border-black/5 pt-4">
				<SlidersHorizontal class="h-5 w-5 flex-shrink-0 text-[#17200f]/80" aria-hidden="true" />
				<span class="whitespace-nowrap text-sm font-semibold text-[#17200f]/60">Up to £{maxPrice}</span>
				<input
					type="range"
					min={priceRange.min}
					max={priceRange.max}
					step="20"
					bind:value={maxPrice}
					class="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-black/40 accent-[#5C9B19]"
				/>
			</div>
		</div>

		<!-- Trust row -->
		<div class="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-md text-black/75">
			<span class="flex items-center gap-2"><ShieldCheck class="h-6 w-6 text-[#5C9B19]" aria-hidden="true" />Secure checkout</span>
			<span class="flex items-center gap-2"><CreditCard class="h-6 w-6 text-[#5C9B19]" aria-hidden="true" />Book with a deposit, pay the rest later</span>
			<span class="flex items-center gap-2"><TrendingUp class="h-6 w-6 text-[#5C9B19]" aria-hidden="true" />Prices shown per person, all in</span>
		</div>
	</div>
</section>

<!-- TOUR GRID -->
<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
	<div class="mx-auto max-w-[1440px]">
		<div class="mb-8 flex items-center justify-between">
			<p class="text-lg text-[#17200f]/75">{filtered.length} tour{filtered.length === 1 ? '' : 's'} found</p>
		</div>

		<div class="tour-grid grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as tour (tour.slug.current)}
				<a
					href={`/tours/${tour.slug.current}`}
					data-slug={tour.slug.current}
					class="tour-card group relative translate-y-7 overflow-hidden rounded-[24px] bg-white opacity-0 shadow-sm transition-all duration-700 hover:shadow-[0_24px_48px_-24px_rgba(23,32,15,0.25)] {visibleCards.has(
						tour.slug.current
					)
						? '!translate-y-0 !opacity-100'
						: ''}"
				>
					<div class="relative aspect-[4/3] overflow-hidden">
						{#if tour.image}
							<img
								src={urlFor(tour.image).width(600).height(450).url()}
								alt={tour.title}
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
								loading="lazy"
							/>
						{/if}
						{#if tour.popular}
							<span class="absolute left-4 top-4 rounded-full bg-[#F98315] px-3 py-1 text-[11px] font-bold uppercase tracking-[.14em] text-white shadow">
								Popular
							</span>
						{/if}
						<span class="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[13px] font-bold text-[#17200f] shadow">
							<Star class="h-3 w-3 fill-[#F98315] text-[#F98315]" aria-hidden="true" />
							{tour.rating}
						</span>
					</div>

					<div class="p-5">
						<p class="mb-1.5 flex items-center gap-1 text-[14px] font-bold uppercase tracking-[.1em] text-[#5C9B19]">
							<MapPin class="h-4 w-4" aria-hidden="true" />
							{tour.country}
						</p>
						<h3 class="font-bold text-2xl leading-snug text-[#17200f]">{tour.title}</h3>
						<p class="mt-2 text-lg leading-relaxed text-[#17200f]/85">{tour.summary}</p>

						<div class="mt-4 flex items-center gap-4 text-sm text-[#17200f]/65">
							<span class="flex items-center gap-1"><Clock3 class="h-3.5 w-3.5" aria-hidden="true" />{tour.duration}</span>
							<span class="flex items-center gap-1"><Users class="h-3.5 w-3.5" aria-hidden="true" />{tour.groupSize}</span>
						</div>

						<div class="mt-4 flex items-end justify-between border-t border-black/5 pt-4">
							<div>
								<p class="text-[14px] uppercase tracking-[.1em] text-[#17200f]/65">From</p>
								<p class="font-bold text-2xl text-[#17200f]">£{tour.price}<span class="text-lg font-normal text-[#17200f]/65"> /person</span></p>
							</div>
							<span class="flex items-center gap-1 text-base font-bold text-[#5C9B19] transition group-hover:text-[#F98315]">
								View & book
								<ArrowRight class="h-3.5 w-3.5" aria-hidden="true" />
							</span>
						</div>
					</div>
				</a>
			{/each}
		</div>

		{#if filtered.length === 0}
			<p class="py-16 text-center text-sm text-[#17200f]/50">
				Nothing matches those filters — try widening your price range or category.
			</p>
		{/if}
	</div>
</section>

<TestimonialBand />

<Article />

<CTABanner />