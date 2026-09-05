<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { error } from '@sveltejs/kit';
	import { getCountryBySlug } from '$lib/data/destinations';
	import { getTourBySlug } from '$lib/data/tours';
	import { articles } from '$lib/data/articles';
	import { tourStore, type TourListItem } from '$lib/stores/tourStore.svelte';
	import CityGallery from '../../../components/CityGallery.svelte';
	import CTABanner from '../../../components/CTABanner.svelte';
	import {
		ArrowLeft,
		ArrowUpRight,
		MapPin,
		Clock3,
		Wallet,
		Utensils,
		Lightbulb,
		Check
	} from 'lucide-svelte';

	const slug = page.params.slug;
	const country = getCountryBySlug(slug);

	if (!country) {
		throw error(404, 'Destination not found');
	}

	function resolveTour(exp: (typeof country.experiences)[number]) {
		return exp.tourSlug ? getTourBySlug(exp.tourSlug) : undefined;
	}

	function handleAddExperience(exp: (typeof country.experiences)[number]): void {
		const tour = resolveTour(exp);
		if (!tour) return;
		const item: TourListItem = {
			id: tour.slug,
			slug: tour.slug,
			title: tour.title,
			image: tour.image,
			price: tour.price,
			deposit: tour.deposit,
			travelers: 1,
			duration: tour.duration,
			country: tour.country
		};
		tourStore.toggle(item);
	}

	function handleBookExperience(exp: (typeof country.experiences)[number]): void {
		const tour = resolveTour(exp);
		if (!tour) return;
		if (!tourStore.has(tour.slug)) {
			tourStore.add({
				id: tour.slug,
				slug: tour.slug,
				title: tour.title,
				image: tour.image,
				price: tour.price,
				deposit: tour.deposit,
				travelers: 1,
				duration: tour.duration,
				country: tour.country
			});
		}
		goto('/book');
	}

	const relatedArticles = $derived(
		country
			? articles
					.filter((a) => a.destination.toLowerCase().includes(country.name.toLowerCase()))
					.slice(0, 3)
			: []
	);

	let openCity = $state<number | null>(null);
</script>

<svelte:head>
	<title>{country ? `${country.name} — Gidi Tour` : 'Gidi Tour'}</title>
	{#if country}
		<meta name="description" content={country.intro} />
		<link rel="canonical" href={`https://www.giditour.com/destinations/${country.slug}`} />
		<meta property="og:type" content="website" />
		<meta property="og:title" content={`${country.name} — Gidi Tour`} />
		<meta property="og:description" content={country.intro} />
		<meta property="og:image" content={country.heroImage} />
	{/if}
</svelte:head>

{#if country}
	<!-- HERO -->
	<section class="relative">
		<div class="relative h-[55vh] min-h-95 w-full overflow-hidden sm:h-[65vh]">
			<img
				src={country.heroImage}
				alt={country.name}
				class="absolute inset-0 h-full w-full object-cover"
			/>
			<div
				class="absolute inset-0 bg-linear-to-t from-[#17200f]/90 via-[#17200f]/20 to-transparent"
			></div>
		</div>

		<div class="relative mx-auto -mt-40 max-w-360 px-5 sm:px-8 lg:px-12">
			<a
				href="/destinations"
				class="mb-4 inline-flex items-center gap-1.5 text-sm font-bold text-white/80 transition hover:text-white"
			>
				<ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
				All destinations
			</a>

			<span
				class="mb-4 inline-flex w-fit items-center rounded-full bg-white/40 px-3 py-1 text-[14px] font-bold capitalize tracking-widest text-[#F98315]"
			>
				{country.region}
			</span>

			<h1
				class="font-bold text-4xl leading-[1.05] tracking-[-.03em] text-white sm:text-5xl lg:text-6xl"
			>
				{country.name}
			</h1>

			<div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/80">
				<span class="flex items-center gap-1.5"
					><MapPin class="h-3.5 w-3.5" aria-hidden="true" />Best {country.bestTime}</span
				>
				<span class="flex items-center gap-1.5"
					><Clock3 class="h-3.5 w-3.5" aria-hidden="true" />{country.duration}</span
				>
				<span class="flex items-center gap-1.5"
					><Wallet class="h-3.5 w-3.5" aria-hidden="true" />From {country.priceFrom}</span
				>
			</div>
		</div>
	</section>

	<!-- INTRO -->
	<section class="bg-[#f7f3ea] px-5 pb-4 pt-16 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-3xl">
			<p class="text-lg leading-relaxed text-[#17200f]/89">{country.intro}</p>
		</div>
	</section>

	<!-- CITIES & PLACES -->
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-360">
			<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl md:text-5xl">
				Cities & places
			</h2>
			<p class="mt-2 text-sm text-[#17200f]/85">
				{country.cities.length} places worth building a trip around.
			</p>

			<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each country.cities as city, i (city.name)}
					<button
						type="button"
						onclick={() => (openCity = i)}
						class="group relative overflow-hidden rounded-[22px] text-left"
					>
						<div class="relative aspect-4/3 overflow-hidden rounded-3xl">
							<img
								src={city.image}
								alt={city.name}
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
								loading="lazy"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
							></div>
						</div>
						<div class="absolute inset-x-0 bottom-0 p-5 text-white">
							<h3 class="font-display text-xl">{city.name}</h3>
							<p class="mt-1 text-sm text-white/70">{city.blurb}</p>
							<span
								class="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#F98315] opacity-0 transition group-hover:opacity-100"
							>
								View gallery
								{city.gallery.length} photos
							</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- THINGS TO DO -->
	<section class="bg-[#17200f] rounded-3xl px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-[1440px]">
			<h2 class="font-bold text-3xl tracking-[-.02em] sm:text-4xl md:text-5xl">Things to do</h2>
			<div class="mt-8 grid gap-4 sm:grid-cols-2">
				{#each country.thingsToDo as item, i (item)}
					<div class="flex gap-4 border-b border-white/10 py-4 last:border-0">
						<span class="font-bold text-lg text-[#F98315]">{String(i + 1).padStart(2, '0')}</span>
						<p class="text-[18px] leading-relaxed text-white/70">{item}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- FEATURED EXPERIENCES -->
	{#if country.experiences.length > 0}
		<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
			<div class="mx-auto max-w-[1440px]">
				<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl md:text-5xl">
					Featured Gidi Tour experiences
				</h2>
				<div class="mt-8 grid gap-6 sm:grid-cols-2">
					{#each country.experiences as exp (exp.title)}
						{@const tour = resolveTour(exp)}
						{@const isAdded = tour ? tourStore.has(tour.slug) : false}

						<div class="group relative overflow-hidden rounded-[26px] bg-white shadow-sm">
							<!-- IMAGE + VIEW LINK -->
							<a href={tour ? `/tours/${tour.slug}` : (exp.href ?? '/tours')} class="block">
								<div class="relative aspect-[16/10] overflow-hidden">
									<img
										src={exp.image}
										alt={exp.title}
										class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
										loading="lazy"
									/>
									<div
										class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
									></div>
									<div class="absolute inset-x-0 bottom-0 p-6 text-white">
										<h3 class="font-bold text-2xl">{exp.title}</h3>
										<p class="mt-2 max-w-sm text-sm leading-relaxed text-white/70">{exp.blurb}</p>
										{#if tour}
											<p class="mt-2 text-sm font-bold text-[#F98315]">
												From £{tour.price}/person
											</p>
										{/if}
									</div>
								</div>
							</a>

							{#if tour}
								<!-- ACTION ROW -->
								<div class="flex items-center gap-2 p-4">
									<a
										href={`/tours/${tour.slug}`}
										class="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 px-4 py-2.5 text-sm font-bold text-[#17200f] transition hover:border-black/20"
									>
										View tour
										<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
									</a>
									<button
										type="button"
										aria-label={isAdded
											? `Remove ${tour.title} from tour list`
											: `Add ${tour.title} to tour list`}
										onclick={() => handleAddExperience(exp)}
										class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition {isAdded
											? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#5C9B19]'
											: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
									>
										{#if isAdded}
											<Check class="h-4.5 w-4.5" aria-hidden="true" />
										{:else}
											<span class="text-lg leading-none">+</span>
										{/if}
									</button>
									<button
										type="button"
										onclick={() => handleBookExperience(exp)}
										class="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#5C9B19] px-4 py-2.5 text-sm font-bold text-white transition hover:scale-[1.02]"
									>
										Book
										<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
									</button>
								</div>
							{:else}
								<div class="p-4">
									<a
										href={exp.href ?? '/tours'}
										class="flex items-center justify-center gap-1.5 rounded-full border border-black/10 px-4 py-2.5 text-sm font-bold text-[#17200f]"
									>
										Learn more
										<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
									</a>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- FOOD & CULTURE -->
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-[1440px]">
			<div class="flex items-center gap-3">
				<Utensils class="h-9 w-9 text-[#F98315]" aria-hidden="true" />
				<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl md:text-5xl">
					Food & culture
				</h2>
			</div>
			<div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each country.food as dish (dish.name)}
					<div class="rounded-[22px] border border-black/10 bg-white p-6">
						<h3 class="font-bold text-xl text-[#17200f]">{dish.name}</h3>
						<p class="mt-2 text-sm leading-relaxed text-[#17200f]/60">{dish.desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- TRAVEL TIPS -->
	<section class="bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-[1440px]">
			<div class="flex items-center gap-3">
				<Lightbulb class="h-9 w-9 text-[#5C9B19]" aria-hidden="true" />
				<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl md:text-5xl">
					Travel tips for {country.name}
				</h2>
			</div>
			<div class="mt-8 grid gap-4 sm:grid-cols-2">
				{#each country.travelTips as tip (tip)}
					<div class="flex gap-3 rounded-2xl bg-[#f7f3ea] p-5">
						<span class="mt-2.5 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#5C9B19]"></span>
						<p class="text-[18px] leading-relaxed text-[#17200f]/95">{tip}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- RELATED STORIES -->
	{#if relatedArticles.length > 0}
		<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
			<div class="mx-auto max-w-[1440px]">
				<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl">
					Related stories
				</h2>
				<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each relatedArticles as article (article.slug)}
						<a
							href={`/stories/${article.slug}`}
							class="group relative overflow-hidden rounded-[22px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
						>
							<div class="relative aspect-[4/3] overflow-hidden">
								<img
									src={article.image}
									alt={article.title}
									class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									loading="lazy"
								/>
							</div>
							<div class="p-5">
								<h3 class="font-bold text-lg leading-snug text-[#17200f]">{article.title}</h3>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- BOOK CTA -->
	<CTABanner />

	{#if openCity !== null}
		<CityGallery
			cityName={country.cities[openCity].name}
			blurb={country.cities[openCity].blurb}
			images={country.cities[openCity].gallery}
			onClose={() => (openCity = null)}
		/>
	{/if}
{/if}