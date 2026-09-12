<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		ArrowLeft,
		ArrowRight,
		Star,
		Clock3,
		Users,
		MapPin,
		Check,
		ShieldCheck,
		X,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import CTABanner from '../../../components/CTABanner.svelte';
	import SeoHead from '../../../components/SeoHead.svelte';
	import { tourStore, type TourListItem } from '$lib/stores/tourStore.svelte';
	import { urlFor } from '$lib/sanity/client';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const tour = $derived(data.tour);
	const related = $derived(data.related ?? []);

	// SEO: tour's own seo field first, then site default
	const seoTitle = $derived(
		tour.seo?.metaTitle ?? `${tour.title} — Gidi Tour`
	);
	const seoDescription = $derived(tour.seo?.metaDescription ?? tour.summary);
	const seoImage = $derived(tour.seo?.ogImage ?? tour.image);

	const coverImageUrl = $derived(tour.image ? urlFor(tour.image).width(1600).height(900).url() : '');
	const galleryUrls = $derived((tour.gallery ?? []).map((img) => urlFor(img).width(1200).height(900).url()));

	let inTourList = $derived(tourStore.has(tour.slug.current));

	function buildTourListItem(): TourListItem {
		return {
			id: tour.slug.current,
			slug: tour.slug.current,
			title: tour.title,
			image: coverImageUrl,
			price: tour.price,
			deposit: tour.deposit,
			travelers,
			duration: tour.duration ?? '',
			country: tour.country
		};
	}

	function handleAddToTour(): void {
		tourStore.toggle(buildTourListItem());
	}

	function handleBookNow(): void {
		const item = buildTourListItem();
		if (tourStore.has(tour.slug.current)) {
			tourStore.updateTravelers(tour.slug.current, travelers);
		} else {
			tourStore.add(item);
		}
		goto('/book');
	}

	let travelers = $state(1);
	const totalPrice = $derived(tour.price * travelers);
	const totalDeposit = $derived(tour.deposit * travelers);

	let lightboxIndex = $state<number | null>(null);
	function openLightbox(i: number) {
		lightboxIndex = i;
	}
	function closeLightbox() {
		lightboxIndex = null;
	}
	function nextImage() {
		if (lightboxIndex === null) return;
		lightboxIndex = (lightboxIndex + 1) % galleryUrls.length;
	}
	function prevImage() {
		if (lightboxIndex === null) return;
		lightboxIndex = (lightboxIndex - 1 + galleryUrls.length) % galleryUrls.length;
	}
	function handleKeydown(e: KeyboardEvent) {
		if (lightboxIndex === null) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowRight') nextImage();
		if (e.key === 'ArrowLeft') prevImage();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url={`https://www.giditour.com/tours/${tour.slug.current}`}
	siteName={data.siteSettings?.siteName}
/>

<svelte:head>
	<meta property="og:type" content="product" />
	<meta property="product:price:amount" content={String(tour.price)} />
	<meta property="product:price:currency" content="USD" />
</svelte:head>

<!-- HERO -->
<section class="relative">
	<div class="relative h-[55vh] min-h-80 w-full overflow-hidden sm:h-[65vh]">
		{#if coverImageUrl}
			<img src={coverImageUrl} alt={tour.title} class="absolute inset-0 h-full w-full object-cover" />
		{/if}
		<div class="absolute inset-0 bg-linear-to-t from-[#17200f]/90 via-[#17200f]/25 to-transparent"></div>
	</div>

	<div class="relative mx-auto -mt-60 max-w-360 px-5 sm:px-8 lg:px-12">
		<a
			href="/tours"
			class="mb-4 inline-flex items-center gap-1.5 text-base font-bold text-white/80 transition hover:text-white"
		>
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
	<div class="mx-auto grid max-w-360 gap-10 lg:grid-cols-[1fr_380px]">
		<!-- LEFT: content -->
		<div>
			<p class="text-lg leading-relaxed text-[#17200f]/80">{tour.summary}</p>

			<!-- Gallery -->
			{#if galleryUrls.length > 0}
				<div class="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
					{#each galleryUrls as src, i (src)}
						<button
							type="button"
							onclick={() => openLightbox(i)}
							class="group relative aspect-4/3 overflow-hidden rounded-2xl first:col-span-2 first:row-span-2 first:aspect-square sm:first:col-span-2"
						>
							<img
								{src}
								alt={`${tour.title} photo ${i + 1}`}
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
								loading="lazy"
							/>
						</button>
					{/each}
				</div>
			{/if}

			<!-- Highlights -->
			{#if tour.highlights?.length}
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
			{/if}

			<!-- Includes -->
			{#if tour.includes?.length}
				<div class="mt-12">
					<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl">What's included</h2>
					<div class="mt-5 flex flex-col gap-3">
						{#each tour.includes as item (item)}
							<div class="flex items-center gap-3 border-b border-black/10 py-3 last:border-0">
								<Check class="h-4 w-4 shrink-0 text-[#5C9B19]" aria-hidden="true" />
								<p class="text-base text-[#17200f]/70">{item}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<div class="mt-10 flex items-center gap-3 rounded-2xl border border-[#5C9B19]/20 bg-[#5C9B19]/5 p-5">
				<ShieldCheck class="h-6 w-6 shrink-0 text-[#5C9B19]" aria-hidden="true" />
				<p class="text-base leading-relaxed text-[#17200f]/70">
					Secure a spot with a {Math.round((tour.deposit / tour.price) * 100)}% deposit; pay the
					balance before departure. Full cancellation terms are confirmed in writing before you
					pay anything.
				</p>
			</div>
		</div>

		<!-- RIGHT: sticky booking panel -->
		<div>
			<div class="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm lg:sticky lg:top-28">
				<div class="flex items-baseline justify-between">
					<div>
						<p class="text-[12px] uppercase tracking-widest text-[#17200f]/70">From</p>
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
				<button
					type="button"
					onclick={handleAddToTour}
					class="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 px-6 py-3.5 text-sm font-bold transition
	{inTourList
						? 'border-[#5C9B19] bg-[#5C9B19]/10 text-[#5C9B19]'
						: 'border-black/10 bg-white text-[#17200f] hover:border-[#5C9B19]/40'}"
				>
					{#if inTourList}
						<Check class="h-4 w-4" aria-hidden="true" />
						Added to your tour list
					{:else}
						Add to Tour List
					{/if}
				</button>
				<button
					type="button"
					onclick={handleBookNow}
					class="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:scale-[1.02]"
				>
					Book this tour
					<ArrowRight class="h-4 w-4" aria-hidden="true" />
				</button>
				<p class="mt-3 text-center text-sm text-[#17200f]/0">
					No payment taken yet — you'll review everything first.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- RELATED TOURS -->
{#if related.length > 0}
	<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-360">
			<h2 class="font-bold text-2xl tracking-[-.02em] text-[#17200f] sm:text-3xl">
				More tours in {tour.country}
			</h2>
			<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each related as t (t.slug.current)}
					<a
						href={`/tours/${t.slug.current}`}
						class="group relative overflow-hidden rounded-[22px] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
					>
						<div class="relative aspect-4/3 overflow-hidden">
							{#if t.image}
								<img
									src={urlFor(t.image).width(500).height(375).url()}
									alt={t.title}
									class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									loading="lazy"
								/>
							{/if}
						</div>
						<div class="p-5">
							<h3 class="font-bold text-lg leading-snug text-[#17200f]">{t.title}</h3>
							<p class="mt-1 font-bold text-lg text-[#5C9B19]">
								£{t.price}<span class="text-sm font-normal text-[#17200f]/70"> /person</span>
							</p>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}

<CTABanner />

<!-- LIGHTBOX -->
{#if lightboxIndex !== null}
	<div
		class="fixed inset-0 z-110 flex items-center justify-center bg-black/90 p-4"
		transition:fade={{ duration: 200 }}
		onclick={closeLightbox}
		role="presentation"
	>
		<button
			type="button"
			onclick={closeLightbox}
			aria-label="Close image"
			class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
		>
			<X class="h-5 w-5" aria-hidden="true" />
		</button>
		{#if galleryUrls.length > 1}
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					prevImage();
				}}
				aria-label="Previous image"
				class="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
			>
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
			</button>
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					nextImage();
				}}
				aria-label="Next image"
				class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
			>
				<ChevronRight class="h-5 w-5" aria-hidden="true" />
			</button>
		{/if}
		{#key lightboxIndex}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={galleryUrls[lightboxIndex]}
				alt={`${tour.title} photo ${lightboxIndex + 1}`}
				class="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"
				onclick={(e) => e.stopPropagation()}
				in:scale={{ duration: 250, start: 0.96, easing: cubicOut }}
			/>
		{/key}
	</div>
{/if}