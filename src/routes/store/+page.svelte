<script lang="ts">
	import SeoHead from '../../components/SeoHead.svelte';
	import StoreProductCard from '../../components/StoreProductCard.svelte';
	import type { PageData } from './$types';
	import type { StoreProduct } from '$lib/sanity/queries/store';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const currency = $derived(data.currency);
	const rate = $derived(data.rate);

	const seoTitle = $derived(
		data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Gidi Tour Store'
	);
	const seoDescription = $derived(
		data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
	);
	const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);

	const products = $derived<StoreProduct[]>(data.storeProducts ?? []);

	let activeCategory = $state<'all' | 'magazine' | 'merchandise'>('all');

	const filtered = $derived(
		activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory)
	);

	const PRODUCTS_PER_PAGE = 12;

	let visibleCount = $state(PRODUCTS_PER_PAGE);

	const visibleProducts = $derived(filtered.slice(0, visibleCount));

	const hasMore = $derived(visibleCount < filtered.length);
	const canShowLess = $derived(visibleCount > PRODUCTS_PER_PAGE);

	function showMore() {
		visibleCount += PRODUCTS_PER_PAGE;
	}

	function showLess() {
		visibleCount = PRODUCTS_PER_PAGE;
	}
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/store"
	siteName={data.siteSettings?.siteName}
/>

<!-- HERO -->
<section class="relative overflow-hidden bg-[#f7f3ea] px-5 pb-10 pt-20 sm:px-8 lg:px-12 lg:pt-24">
	<div class="relative mx-auto flex max-w-360 flex-col items-center text-center">
		<span
			class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
		>
			Gidi Tour Store
		</span>
		<h1
			class="mx-0 mt-5 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
		>
			Read it. Wear it.<br />Take it with you.
		</h1>
		<p class="mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
			Digital issues of the Gidi Tour Magazine and practical travel gear, in one checkout.
		</p>

		<!-- Category pills -->
		<div class="mt-8 flex items-center gap-2">
			<button
				type="button"
				onclick={() => {
					activeCategory = 'all';
					visibleCount = PRODUCTS_PER_PAGE;
				}}
				class="rounded-full border px-4 py-2 text-sm font-semibold transition {activeCategory ===
				'all'
					? 'border-[#17200f] bg-[#17200f] text-white'
					: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
			>
				All products
			</button>
			<button
				type="button"
				onclick={() => {
					activeCategory = 'magazine';
					visibleCount = PRODUCTS_PER_PAGE;
				}}
				class="rounded-full border px-4 py-2 text-sm font-semibold transition {activeCategory ===
				'magazine'
					? 'border-[#17200f] bg-[#17200f] text-white'
					: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
			>
				Magazine
			</button>
			<button
				type="button"
				onclick={() => {
					activeCategory = 'merchandise';
					visibleCount = PRODUCTS_PER_PAGE;
				}}
				class="rounded-full border px-4 py-2 text-sm font-semibold transition {activeCategory ===
				'merchandise'
					? 'border-[#17200f] bg-[#17200f] text-white'
					: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
			>
				Merchandise
			</button>
		</div>
	</div>
</section>

<!-- PRODUCT GRID -->
<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
	<div class="mx-auto max-w-360">
		{#if filtered.length > 0}
			<p class="mb-6 text-sm text-[#17200f]/50">
				{filtered.length}
				{filtered.length === 1 ? 'product' : 'products'}
			</p>
		{/if}

		<div class="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
			{#each visibleProducts as product (product.slug.current)}
				<StoreProductCard {product} {currency} {rate} />
			{/each}
		</div>
		{#if filtered.length > PRODUCTS_PER_PAGE}
			<div class="mt-10 flex items-center justify-center gap-3">
				{#if hasMore}
					<button
						type="button"
						onclick={showMore}
						class="rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
					>
						Show more
					</button>
				{/if}

				{#if canShowLess}
					<button
						type="button"
						onclick={showLess}
						class="rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-bold text-[#17200f] transition hover:border-black/20"
					>
						Show less
					</button>
				{/if}
			</div>
		{/if}
		{#if filtered.length === 0}
			<p class="py-16 text-center text-sm text-[#17200f]/50">Nothing here yet — check back soon.</p>
		{/if}
	</div>
</section>