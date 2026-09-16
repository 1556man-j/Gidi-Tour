<script lang="ts">
	import Article from '../components/Article.svelte';
	import CTABanner from '../components/CTABanner.svelte';
	import GidiExperience from '../components/GidiExperience.svelte';
	import { reveal } from '$lib/utils/reveal';
	import { ArrowRight, Compass, Star, MapPin, CheckCircle2Icon } from 'lucide-svelte';
	import DownloadApp from '../components/DownloadApp.svelte';
	import type { PageData } from './$types';
	import TestimonialBand from '../components/TestimonialBand.svelte';
	// import { countries } from '$lib/data/destinations';
	import SeoHead from '../components/SeoHead.svelte';
	import { urlFor } from '$lib/sanity/client';
	import FaqSection from '../components/FaqSection.svelte';

	interface Props {
		data: PageData;
		heroHeadline?: string;
		heroHeadlineAccent?: string;
		heroSubcopy?: string;
		heroSocialProof?: string;
	}

	let {
		data,
		heroHeadline = 'Travel that feels like',
		heroHeadlineAccent = 'coming home.',
		heroSubcopy = 'Go beyond the guidebook. We plan trips around the culture, food and people that make a place unforgettable.',
		heroSocialProof = '12,000+ travelers explored with Gidi'
	}: Props = $props();

	// Falls back to the site-wide default (from +layout.server.ts / siteSettings)
	// if this specific page has no Page SEO document yet.
	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	const featuredCountries = $derived((data.sanityDestinations ?? []).slice(0, 5));

	let activeCountry = $state(0);
</script>

<!-- <svelte:head>
	<title>Gidi Tour - Authentic Travel Experiences Across Africa & Beyond</title>
	<meta
		name="description"
		content="Discover memorable tours, food, culture, history, nature and local experiences across Nigeria, Ghana, Kenya, Tanzania, Rwanda, Egypt, Morocco, South Africa and the UK with Gidi Tour."
	/>
	<link rel="canonical" href="https://giditour.com/" />
	<meta
		name="robots"
		content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
	/>

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Gidi Tour" />
	<meta
		property="og:title"
		content="Gidi Tour - Authentic Travel Experiences Across Africa & Beyond"
	/>
	<meta
		property="og:description"
		content="Go beyond the usual highlights. Explore places through food, culture, history, nature and local stories."
	/>
	<meta property="og:url" content="https://giditour.com/" />
	<meta
		property="og:image"
		content="https://res.cloudinary.com/du8ocxxu1/image/upload/v1787983116/tour_acdwyc.png"
	/>
	<meta property="og:image:alt" content="Travel experience in Africa" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta
		name="twitter:title"
		content="Gidi Tour - Authentic Travel Experiences Across Africa & Beyond"
	/>
	<meta
		name="twitter:description"
		content="Discover places through local food, culture, history, nature and unforgettable experiences."
	/>
	<meta
		name="twitter:image"
		content="https://res.cloudinary.com/du8ocxxu1/image/upload/v1787983116/tour_acdwyc.png"
	/>

	<script type="application/ld+json">
		{JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'TravelAgency',
					'@id': 'https://giditour.com/#organization',
					name: 'Gidi Tour',
					url: 'https://giditour.com/',
					description: 'Gidi Tour creates guided travel experiences across Africa and the United Kingdom, including food, culture, history, nature and local experiences.',
					areaServed: ['Nigeria', 'Ghana', 'Kenya', 'Tanzania', 'Rwanda', 'Egypt', 'Morocco', 'South Africa', 'United Kingdom']
				},
				{
					'@type': 'WebSite',
					'@id': 'https://giditour.com/#website',
					url: 'https://giditour.com/',
					name: 'Gidi Tour',
					publisher: { '@id': 'https://giditour.com/#organization' },
					inLanguage: 'en'
				}
			]
		})}
	</script>
</svelte:head> -->

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/"
	siteName={data.siteSettings?.siteName}
/>

<!-- Hero -->
<section
	class="relative w-full overflow-x-hidden overflow-y-hidden bg-[#f7f3ea] pb-16 pt-24 max-md:pb-10 max-md:pt-20 lg:pt-24"
	use:reveal
>
	<!-- Glow -->
	<div
		class="pointer-events-none absolute inset-x-0 -top-[10%] h-[60%]"
		style="background: radial-gradient(60% 60% at 30% 0%, rgba(92,155,25,0.12), transparent 70%);"
		aria-hidden="true"
	></div>

	<div
		class="relative mx-auto grid max-w-[1440px] grid-cols-2 items-center gap-10 px-5 max-md:grid-cols-1 max-md:gap-12 sm:px-8 lg:px-12"
	>
		<!-- LEFT: content -->
		<div class="max-md:text-center">
			<span
				class="mb-3 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-[14px] font-bold uppercase text-[#5C9B19] shadow-sm"
			>
				Built for the curious
			</span>

			<h1
				class="font-bold mb-3 text-5xl leading-[.95] tracking-[-.03em] font-bold text-[#17200f] sm:text-6xl"
			>
				<span class="block">{heroHeadline}</span>
				<span class="block text-[#F98315]">{heroHeadlineAccent}</span>
				<div class="flex w-full items-center justify-center md:justify-start">
					<div
						class="relative -top-1 mb-3 h-1.5 w-[70%] rounded-full bg-gradient-to-r from-[#F98315] to-[#5C9B19] md:w-100"
						aria-hidden="true"
					></div>
				</div>
			</h1>

			<p class="mb-6 max-w-[440px] text-[18px] leading-[1.55] text-[#17200f]/70 max-md:mx-auto">
				{heroSubcopy}
			</p>

			<div class="mb-8 flex flex-wrap items-center gap-4 max-md:justify-center">
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href="/book"
					class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
				>
					Plan my trip
					<ArrowRight class="h-4 w-4" aria-hidden="true" />
				</a>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a
					href="/tours"
					class="text-sm font-bold border px-6 py-3 rounded-full border-black/40 text-[#17200f] transition hover:text-[#F98315]"
				>
					Browse experiences →
				</a>
			</div>

			<div class="mb-6 flex w-full items-center justify-center md:justify-start">
				<div
					class="flex w-max items-center gap-3.5 rounded-[10px] border-y border-black/5 bg-white py-2 pl-2 max-md:justify-center"
				>
					<div class="flex items-center" aria-hidden="true">
						<div
							class="-ml-2.5 h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white first:ml-0"
						>
							<img src="/images/people/avatar-1.webp" alt="" class="h-full w-full object-cover" />
						</div>
						<div
							class="-ml-2.5 h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white"
						>
							<img src="/images/people/avatar-2.webp" alt="" class="h-full w-full object-cover" />
						</div>
						<div
							class="-ml-2.5 h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white"
						>
							<img src="/images/people/avatar-3.webp" alt="" class="h-full w-full object-cover" />
						</div>
						<div
							class="-ml-2.5 h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white"
						>
							<img src="/images/people/avatar-4.webp" alt="" class="h-full w-full object-cover" />
						</div>
						<div
							class="-ml-2.5 h-[34px] w-[34px] flex-shrink-0 overflow-hidden rounded-full border-2 border-white"
						>
							<img src="/images/people/avatar-5.webp" alt="" class="h-full w-full object-cover" />
						</div>
					</div>
					<p class="m-0 max-w-[180px] text-start text-[13px] leading-[1.3] text-[#17200f]/80">
						{heroSocialProof}
					</p>
				</div>
			</div>

			<DownloadApp />
		</div>

		<!-- RIGHT: visual frame -->
		<div class="flex items-start justify-end max-md:justify-center">
			<div
				class="relative aspect-[845/1015] w-[min(600px,90vw)] max-md:mx-auto max-md:w-[min(430px,92vw)]"
			>
				<!-- Concentric ring outlines -->
				<svg
					class="absolute inset-0 h-full w-full"
					viewBox="0 0 845 1015"
					fill="none"
					aria-hidden="true"
					xmlns="http://www.w3.org/2000/svg"
				>
					<rect
						x="154.5"
						y="93.5"
						width="590"
						height="817"
						rx="295"
						stroke="#17200f"
						stroke-opacity="0.07"
						stroke-width="7"
					/>
					<rect
						x="103.5"
						y="23.5"
						width="692"
						height="957"
						rx="346"
						stroke="#17200f"
						stroke-opacity="0.07"
						stroke-width="7"
					/>
				</svg>

				<!-- Pill image -->
				<div
					class="absolute left-[24.85%] top-[15.96%] h-[68.08%] w-[56.9%] overflow-hidden rounded-full shadow-[0_30px_60px_-20px_rgba(23,32,15,0.35)]"
				>
					<img
						src="/images/hero/hero.webp"
						alt="Traveler exploring with Gidi"
						loading="eager"
						class="h-full w-full object-cover"
					/>
				</div>

				<!-- Destinations badge -->
				<div
					class="absolute left-[2%] top-[25%] flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(23,32,15,0.25)] max-md:gap-2 max-md:px-3 max-md:py-2.5"
				>
					<span
						class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-[#5C9B19]/12 text-[#5C9B19] max-md:h-[30px] max-md:w-[30px]"
					>
						<MapPin class="h-5 w-5" aria-hidden="true" />
					</span>
					<div class="flex flex-col leading-[1.2]">
						<span class="text-[13px] font-bold text-[#17200f]">Destinations</span>
						<span class="text-[11px] text-[#17200f]/55">50+ countries</span>
					</div>
				</div>

				<!-- Rating badge -->
				<div
					class="absolute right-0 top-[44.6%] flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(23,32,15,0.25)] max-md:gap-2 max-md:px-3 max-md:py-2.5"
				>
					<span
						class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-[#F98315]/14 text-[#F98315] max-md:h-[30px] max-md:w-[30px]"
					>
						<Star class="h-5 w-5 fill-current" aria-hidden="true" />
					</span>
					<div class="flex flex-col leading-[1.2]">
						<span class="text-[16px] font-extrabold text-[#17200f]">4.9</span>
						<span class="text-[11px] text-[#17200f]/55">from 3k+ reviews</span>
					</div>
				</div>

				<!-- Experiences badge -->
				<div
					class="absolute left-[8%] top-[59%] flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_16px_40px_-12px_rgba(23,32,15,0.25)] max-md:gap-2 max-md:px-3 max-md:py-2.5"
				>
					<span
						class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-[10px] bg-[#5C9B19]/12 text-[#5C9B19] max-md:h-[30px] max-md:w-[30px]"
					>
						<Compass class="h-5 w-5" aria-hidden="true" />
					</span>
					<div class="flex flex-col leading-[1.2]">
						<span class="text-[13px] font-bold text-[#17200f]">Experiences</span>
						<span class="text-[11px] text-[#17200f]/55">crafted, not generic</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- NUMBERS -->
<section class="bg-[#fdfdfdd5] px-5 py-20 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-[1100px]">
		<div class="reveal text-center">
			<p class="text-[17px] font-bold capitalize text-[#5C9B19]">Gidi Tour by numbers</p>
			<h2 class="font-bold mt-3 text-4xl tracking-[-.03em] sm:text-5xl">
				Small details. Big memories.
			</h2>
		</div>

		<div
			class="reveal mt-12 bg-white shadow-md grid grid-cols-2 divide-x divide-y divide-black/10 sm:grid-cols-4 sm:divide-y-0"
		>
			<div class="p-6 text-center">
				<p class="font-bold text-4xl lg:text-6xl text-[#5C9B19]">09+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Countries where you can discover new places, cultures, flavours, and stories.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-bold text-4xl lg:text-6xl text-[#5C9B19]">100+</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Curated experiences designed to help you see each destination beyond the usual tourist
					spots.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-bold text-4xl lg:text-6xl text-[#5C9B19]">100%</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Local experiences built around the people, culture, food, history, and everyday life of
					each destination.
				</p>
			</div>
			<div class="p-6 text-center">
				<p class="font-bold text-4xl lg:text-6xl text-[#F98315]">∞</p>
				<p class="mt-5 text-[16px] font-normal text-[#33323e]">
					Stories, connections, and memories waiting to become part of your journey.
				</p>
			</div>
		</div>
	</div>
</section>

<!-- trust section -->
<section class="ft-container mx-auto px-6 py-8 md:py-14 bg-muted/20" use:reveal>
	<div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
		<div class="w-full order-2 md:order-1">
			<div
				class="relative aspect-square rounded-ft-full overflow-hidden ft-bg-dots-gradient ft-bg-dots--gradient flex items-center justify-center"
			>
				<img
					src="images/people/device.png"
					alt="FinTribe member"
					class="w-full h-100 object-contain py-6 md:p-0"
					loading="lazy"
				/>
			</div>

			<div class="flex items-center gap-1.5 text-xs text-muted-foreground my-6 pl-1.5 md:hidden">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-shield-check size-3.5 text-ft-green"
					aria-hidden="true"
					><path
						d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
					></path><path d="m9 12 2 2 4-4"></path></svg
				>Bank-grade encryption · BVN-secured · CBN-licensed partners
			</div>

			<div class="md:hidden block">
				<DownloadApp />
			</div>
		</div>
		<div class="order-1 md:order-2 text-center md:text-left text-black">
			<div
				class="mb-3 inline-flex items-center rounded-full bg-white px-4 py-1.5 text-[14px] font-bold uppercase text-[#5C9B19] shadow-sm"
			>
				Why Gidi Tour
			</div>
			<h2
				class="Gloock text-3xl md:text-3xl font-extrabold text-ft-black leading-[1.1] mt-4 mb-6 flex flex-col"
			>
				We’re not just another <br class="block md:hidden" />
				<span class="ft-gradient-text"> generic trip.</span>
			</h2>
			<ul class="space-y-4 text-start">
				<li class="flex items-start gap-3 text-black/70 text-sm leading-relaxed">
					<div class="rounded-full p-1 text-[#5C9B19] bg-ft-pink/20 shrink-0">
						<CheckCircle2Icon class="w-4 h-4" />
					</div>
					<p>
						Local experiences: We take you beyond the usual tourist stops and into the food,
						culture, people and stories that give each destination its character.
					</p>
				</li>
				<li class="flex items-start gap-3 text-black/70 text-sm leading-relaxed">
					<div class="rounded-full p-1 text-[#5C9B19] shrink-0">
						<CheckCircle2Icon class="w-4 h-4" />
					</div>
					<p>
						Thoughtfully planned: From transport and guides to activities and meals, we bring the
						important details together so you can focus on enjoying the journey.
					</p>
				</li>
				<li class="flex items-start gap-3 text-black/70 text-sm leading-relaxed">
					<div class="rounded-full p-1 text-[#5C9B19] bg-ft-pink/20 shrink-0">
						<CheckCircle2Icon class="w-4 h-4" />
					</div>
					<p>
						Travel that feels personal: Whether you join a small group or book a private experience,
						every trip is designed to feel more connected, more authentic and more memorable.
					</p>
				</li>
			</ul>
			<div class="items-center gap-1.5 text-xs text-muted-foreground my-6 pl-1.5 hidden md:flex">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-shield-check size-3.5 text-ft-green"
					aria-hidden="true"
					><path
						d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"
					></path><path d="m9 12 2 2 4-4"></path></svg
				>Local knowledge · Curated experiences · Trips made with you in mind
			</div>

			<div class="hidden md:block">
				<DownloadApp />
			</div>
		</div>
	</div>
</section>

<!-- testimonials -->
<TestimonialBand />

<!-- EXPERIENCE -->
<GidiExperience />

<!-- DESTINATIONS -->
<section
	id="destinations"
	class="bg-[#f7f3ea] px-5 py-20 text-[#17200f] sm:px-8 lg:px-12 lg:py-28"
	use:reveal
>
	<div class="mx-auto max-w-[1440px]">
		<div class="reveal mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
			<div class="max-w-xl">
				<p class="text-lg font-bold capitalize text-[#5C9B19]">Where will you go?</p>
				<h2 class="font-bold mt-3 text-5xl leading-[.9] tracking-[-.04em] sm:text-6xl">
					Explore our<br />destinations.
				</h2>
				<p class="mt-5 max-w-md text-sm leading-6 text-black/55">
					Five countries to start with — each one holds far more than a single city. See the full
					list, or dive into one below.
				</p>
			</div>
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href="/destinations" class="text-xs font-bold text-[#F98315]">View all destinations →</a>
		</div>

		<!-- Desktop: single row of taller expanding panels -->
		
<div class="reveal hidden gap-3 lg:flex lg:h-[620px]">
	{#each featuredCountries as country, i (country.slug.current)}
		<a
			href={`/destinations/${country.slug.current}`}
			class="dest-panel group relative overflow-hidden rounded-[26px]"
			class:dest-panel--active={activeCountry === i}
			style="flex-grow: {activeCountry === i ? 3 : 1};"
			onmouseenter={() => (activeCountry = i)}
			onfocusin={() => (activeCountry = i)}
		>
			{#if country.heroImage}
				<img
					src={urlFor(country.heroImage).width(900).height(700).url()}
					alt={country.name}
					class="dest-panel__img absolute inset-0 h-full w-full object-cover"
					loading="lazy"
				/>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/0"></div>

			<div
				class="dest-panel__collapsed absolute inset-x-0 bottom-8 flex items-center justify-center"
				class:opacity-0={activeCountry === i}
			>
				<span class="rotate-180 text-sm font-bold tracking-[.12em] text-white [writing-mode:vertical-rl]">
					{country.name}
				</span>
			</div>

			<div
				class="dest-panel__expanded absolute inset-x-0 bottom-0 p-8"
				class:opacity-0={activeCountry !== i}
				class:translate-y-3={activeCountry !== i}
			>
				<p class="mb-2 text-[14px] font-bold capitalize tracking-[.1em] text-[#F98315]">
					{country.region} - {country.cities?.length ?? 0} cities
				</p>
				<h3 class="font-bold text-4xl text-white">{country.name}</h3>
				<p class="mt-3 max-w-[280px] text-lg leading-relaxed text-white/90">
					{country.intro}
				</p>
				<div class="mt-4 flex items-center gap-4 text-sm text-white/85">
					<span>Best {country.bestTime}</span>
					<span class="h-1 w-1 rounded-full bg-white/80"></span>
					<span>From {country.priceFrom}</span>
				</div>
				<span class="mt-5 grid h-10 w-10 place-items-center rounded-full bg-[#5C9B19] text-white transition group-hover:bg-[#F98315]">
					↗
				</span>
			</div>
		</a>
	{/each}
</div>

<!-- Mobile row -->
<div class="dest-track flex gap-3 overflow-x-auto pb-4 lg:hidden">
	{#each featuredCountries as country (country.slug.current)}
		<a
			href={`/destinations/${country.slug.current}`}
			class="group relative min-h-[380px] min-w-[280px] flex-shrink-0 overflow-hidden rounded-[22px] sm:min-w-[320px]"
		>
			{#if country.heroImage}
				<img
					src={urlFor(country.heroImage).width(700).height(600).url()}
					alt={country.name}
					class="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
					loading="lazy"
				/>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/0"></div>
			<div class="absolute inset-x-0 bottom-0 p-6 text-white">
				<p class="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-white/60">
					{country.cities?.length ?? 0} cities
				</p>
				<div class="flex items-end justify-between gap-3">
					<h3 class="font-bold text-2xl">{country.name}</h3>
					<span class="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-[#5C9B19] text-white transition group-hover:bg-[#F98315]">
						↗
					</span>
				</div>
			</div>
		</a>
	{/each}
</div>
	</div>
</section>

<!-- STORIES -->
<Article articles={data.sanityArticles ?? []} />

<!-- FAQs -->
<FaqSection faqs={data.sanityFaqs ?? []} eyebrow="Questions?" heading="Everything you're wondering about." />


<!-- FINAL CTA -->
<CTABanner />

<style>
	.dest-panel {
		min-width: 60px;
		transition: flex-grow 600ms cubic-bezier(0.16, 1, 0.3, 1);
	}

	.dest-panel__img {
		transition: transform 800ms ease;
	}
	.dest-panel--active .dest-panel__img {
		transform: scale(1.05);
	}

	.dest-panel__collapsed {
		transition: opacity 250ms ease;
	}

	.dest-panel__expanded {
		transition:
			opacity 400ms ease,
			transform 400ms ease;
	}

	.dest-track {
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
	}
	.dest-track::-webkit-scrollbar {
		bold: none;
	}
	.dest-track > a {
		scroll-snap-align: start;
	}
</style>
