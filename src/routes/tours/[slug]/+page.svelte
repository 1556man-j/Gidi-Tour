<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { error } from '@sveltejs/kit';
	import { getTourBySlug, tours } from '$lib/data/tours';
	import {
		ArrowLeft, ArrowRight, Star, Clock3, Users, MapPin, Check,
		ShieldCheck, X, ChevronLeft, ChevronRight
	} from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import CTABanner from '../../../components/CTABanner.svelte';

	const slug = page.params.slug;
	const tour = getTourBySlug(slug);

	if (!tour) {
		throw error(404, 'Tour not found');
	}

	const related = $derived(
		tour ? tours.filter((t) => t.slug !== tour.slug && t.countrySlug === tour.countrySlug).slice(0, 3) : []
	);

	let travelers = $state(2);
	const totalPrice = $derived(tour ? tour.price * travelers : 0);
	const totalDeposit = $derived(tour ? tour.deposit * travelers : 0);

	let lightboxIndex = $state<number | null>(null);
	function openLightbox(i: number) {
		lightboxIndex = i;
	}
	function closeLightbox() {
		lightboxIndex = null;
	}
	function nextImage() {
		if (lightboxIndex === null || !tour) return;
		lightboxIndex = (lightboxIndex + 1) % tour.gallery.length;
	}
	function prevImage() {
		if (lightboxIndex === null || !tour) return;
		lightboxIndex = (lightboxIndex - 1 + tour.gallery.length) % tour.gallery.length;
	}
	function handleKeydown(e: KeyboardEvent) {
		if (lightboxIndex === null) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') nextImage();
		if (e.key === 'ArrowLeft') prevImage();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{tour ? `${tour.title} — Gidi Tour` : 'Gidi Tour'}</title>
	{#if tour}
		<meta name="description" content={tour.summary} />
		<link rel="canonical" href={`https://www.giditour.com/tours/${tour.slug}`} />
		<meta property="og:type" content="product" />
		<meta property="og:title" content={tour.title} />
		<meta property="og:description" content={tour.summary} />
		<meta property="og:image" content={tour.image} />
		<meta property="product:price:amount" content={String(tour.price)} />
		<meta property="product:price:currency" content="USD" />
	{/if}
</svelte:head>

{#if tour}
	<!-- HERO -->
	<section class="relative">
		<div class="relative h-[45vh] min-h-80 w-full overflow-hidden sm:h-[55vh]">
			<img src={tour.image} alt={tour.title} class="absolute inset-0 h-full w-full object-cover" />
			<div class="absolute inset-0 bg-linear-to-t from-[#17200f]/90 via-[#17200f]/25 to-transparent"></div>
		</div>

		<div class="relative mx-auto -mt-44 max-w-360 px-5 sm:px-8 lg:px-12">
			<a href="/tours" class="mb-4 inline-flex items-center gap-1.5 text-base font-bold text-white/80 transition hover:text-white">
				<ArrowLeft class="h-4.5 w-4.5" aria-hidden="true" />
				All tours
			</a>

			<div class="flex flex-wrap items-center gap-3">
				<span class="inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-sm font-bold text-[#17200f] shadow">
					<Star class="h-4 w-4 fill-[#F98315] text-[#F98315]" aria-hidden="true" />
					{tour.rating} ({tour.reviewCount} reviews)
				</span>
				{#if tour.popular}
					<span class="rounded-full bg-[#F98315] px-3 py-1 text-sm font-bold text-white shadow">Popular</span>
				{/if}
			</div>

			<h1 class="font-bold mt-4 text-3xl leading-[1.05] tracking-[-.02em] text-white sm:text-4xl lg:text-5xl">
				{tour.title}
			</h1>

			<div class="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-white/85">
				<span class="flex items-center gap-1.5"><MapPin class="h-4 w-4" aria-hidden="true" />{tour.country}</span>
				<span class="flex items-center gap-1.5"><Clock3 class="h-4 w-4" aria-hidden="true" />{tour.duration}</span>
				<span class="flex items-center gap-1.5"><Users class="h-4 w-4" aria-hidden="true" />{tour.groupSize}</span>
			</div>
		</div>
	</section>

	<!-- BODY + STICKY BOOKING PANEL -->
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
		<div class="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1fr_380px]">
			<!-- LEFT: content -->
			<div>
				<p class="text-lg leading-relaxed text-[#17200f]/80">{tour.summary}</p>

				<!-- Gallery -->
				<div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each tour.gallery as src, i (src)}
						<button
							type="button"
							onclick={() => openLightbox(i)}
							class="group relative aspect-4/3 overflow-hidden rounded-2xl first:col-span-2 first:row-span-2 first:aspect-square sm:first:col-span-2"
						>
							<img src={src} alt={`${tour.title} photo ${i + 1}`} class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
						</button>
					{/each}
				</div>

				<!-- Highlights -->
				<div class="mt-12">
					<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl">Trip highlights</h2>
					<div class="mt-5 grid gap-3 sm:grid-cols-2">
						{#each tour.highlights as h (h)}
							<div class="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
								<span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5C9B19]/10">
									<Check class="h-4 w-5 text-[#5C9B19]" aria-hidden="true" />
								</span>
								<p class="text-base leading-relaxed text-[#17200f]/75">{h}</p>
							</div>
						{/each}
					</div>
				</div>

				<!-- Includes -->
				<div class="mt-12">
					<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl">What's included</h2>
					<div class="mt-5 flex flex-col gap-3">
						{#each tour.includes as item (item)}
							<div class="flex items-center gap-3 border-b border-black/10 py-3 last:border-0">
								<Check class="h-4 w-4 flex-shrink-0 text-[#5C9B19]" aria-hidden="true" />
								<p class="text-base text-[#17200f]/70">{item}</p>
							</div>
						{/each}
					</div>
				</div>

				<div class="mt-10 flex items-center gap-3 rounded-2xl border border-[#5C9B19]/20 bg-[#5C9B19]/5 p-5">
					<ShieldCheck class="h-6 w-6 flex-shrink-0 text-[#5C9B19]" aria-hidden="true" />
					<p class="text-base leading-relaxed text-[#17200f]/70">
						Secure a spot with a {Math.round((tour.deposit / tour.price) * 100)}% deposit;  pay the balance
						before departure. Full cancellation terms are confirmed in writing before you pay anything.
					</p>
				</div>
			</div>

			<!-- RIGHT: sticky booking panel -->
			<div>
				<div class="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-28">
					<div class="flex items-baseline justify-between">
						<div>
							<p class="text-[12px] uppercase tracking-[.1em] text-[#17200f]/70">From</p>
							<p class="font-bold text-3xl text-[#17200f]">
								£{tour.price}<span class="text-base font-normal text-[#17200f]/70"> /person</span>
							</p>
						</div>
						<span class="flex items-center gap-1 rounded-full bg-[#F98315]/20 px-2.5 py-1 text-sm font-bold text-[#F98315]">
							<Star class="h-4 w-4 fill-current" aria-hidden="true" />
							{tour.rating}
						</span>
					</div>

					<div class="mt-6 flex flex-col gap-1.5">
						<span class="text-sm font-medium text-[#17200f]/70">Travelers</span>
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

					<div class="mt-6 flex flex-col gap-2 border-t border-black/10 pt-5 text-base">
						<div class="flex items-center justify-between text-[#17200f]/70">
							<span>£{tour.price} - {travelers} traveler{travelers > 1 ? 's' : ''}</span>
							<span class="font-medium text-[#17200f]">£{totalPrice}</span>
						</div>
						<div class="flex items-center justify-between text-[#17200f]/70">
							<span>Deposit due today</span>
							<span class="font-medium text-[#5C9B19]">£{totalDeposit}</span>
						</div>
						<div class="mt-2 flex items-center justify-between border-t border-black/10 pt-3">
							<span class="font-bold text-[#17200f]">Total trip cost</span>
							<span class="font-bold text-xl text-[#17200f]">£{totalPrice}</span>
						</div>
					</div>

					<a
						href={`/book?tour=${tour.slug}&title=${encodeURIComponent(tour.title)}&travelers=${travelers}&deposit=${totalDeposit}&total=${totalPrice}`}
						class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
					>
						Book this tour
						<ArrowRight class="h-4 w-4" aria-hidden="true" />
					</a>
					<p class="mt-3 text-center text-sm text-[#17200f]/0">No payment taken yet — you'll review everything first.</p>
				</div>
			</div>
		</div>
	</section>

	<!-- RELATED TOURS -->
	{#if related.length > 0}
		<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
			<div class="mx-auto max-w-[1440px]">
				<h2 class="font-bold text-2xl tracking-[-.02em] text-[#17200f] sm:text-3xl">
					More tours in {tour.country}
				</h2>
				<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each related as t (t.slug)}
						<a href={`/tours/${t.slug}`} class="group relative overflow-hidden rounded-[22px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
							<div class="relative aspect-[4/3] overflow-hidden">
								<img src={t.image} alt={t.title} class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
							</div>
							<div class="p-5">
								<h3 class="font-bold text-lg leading-snug text-[#17200f]">{t.title}</h3>
								<p class="mt-1 font-bold text-lg text-[#5C9B19]">£{t.price}<span class="text-sm font-normal text-[#17200f]/70"> /person</span></p>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<CTABanner />
{/if}

<!-- LIGHTBOX -->
{#if tour && lightboxIndex !== null}
	<div class="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4" transition:fade={{ duration: 200 }} onclick={closeLightbox} role="presentation">
		<button type="button" onclick={closeLightbox} aria-label="Close image" class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
			<X class="h-5 w-5" aria-hidden="true" />
		</button>
		{#if tour.gallery.length > 1}
			<button type="button" onclick={(e) => { e.stopPropagation(); prevImage(); }} aria-label="Previous image" class="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6">
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
			</button>
			<button type="button" onclick={(e) => { e.stopPropagation(); nextImage(); }} aria-label="Next image" class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6">
				<ChevronRight class="h-5 w-5" aria-hidden="true" />
			</button>
		{/if}
		{#key lightboxIndex}
			<img
				src={tour.gallery[lightboxIndex]}
				alt={`${tour.title} photo ${lightboxIndex + 1}`}
				class="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"
				onclick={(e) => e.stopPropagation()}
				in:scale={{ duration: 250, start: 0.96, easing: cubicOut }}
			/>
		{/key}
	</div>
{/if}