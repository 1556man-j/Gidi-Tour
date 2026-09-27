<script lang="ts">
	import { storeCart } from '$lib/stores/storeCart.svelte';
	import { urlFor } from '$lib/sanity/client';
	import SeoHead from '../../components/SeoHead.svelte';
	import Price from '../../components/Price.svelte';
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

	function outOfStock(product: StoreProduct): boolean {
		if (product.category !== 'merchandise') return false;
		if (product.variants?.length) {
			return product.variants.every((v) => (v.stock ?? 0) <= 0);
		}
		return (product.stock ?? 0) <= 0;
	}

	function addToCart(product: StoreProduct, variant?: string) {
		storeCart.add(
			{
				id: product.slug.current,
				category: product.category,
				title: product.title,
				price: product.price,
				image: product.image ? urlFor(product.image).width(200).height(200).url() : '',
				variant
			},
			1
		);
		// Pop the shared drawer open so they see what they just added.
		// See wiring notes: this reaches the CartDrawer instance mounted in +layout.svelte.
		window.dispatchEvent(new CustomEvent('gt-cart-open'));
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
				onclick={() => (activeCategory = 'all')}
				class="rounded-full border px-4 py-2 text-sm font-semibold transition {activeCategory === 'all'
					? 'border-[#17200f] bg-[#17200f] text-white'
					: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
			>
				All products
			</button>
			<button
				type="button"
				onclick={() => (activeCategory = 'magazine')}
				class="rounded-full border px-4 py-2 text-sm font-semibold transition {activeCategory ===
				'magazine'
					? 'border-[#17200f] bg-[#17200f] text-white'
					: 'border-black/10 text-[#17200f]/60 hover:border-black/20'}"
			>
				Magazine
			</button>
			<button
				type="button"
				onclick={() => (activeCategory = 'merchandise')}
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
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as product (product.slug.current)}
				{@const sold = outOfStock(product)}
				<div class="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
					<div class="relative aspect-[4/3] overflow-hidden bg-black/5">
						{#if product.image}
							<img
								src={urlFor(product.image).width(600).height(450).url()}
								alt={product.title}
								class="absolute inset-0 h-full w-full object-cover"
								loading="lazy"
							/>
						{/if}
						<span
							class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[.1em] text-[#17200f]/70 shadow"
						>
							{product.category === 'magazine' ? 'Digital issue' : 'Merchandise'}
						</span>
						{#if sold}
							<span
								class="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-bold uppercase tracking-[.1em] text-white"
							>
								Sold out
							</span>
						{/if}
					</div>

					<div class="flex flex-1 flex-col p-5">
						{#if product.category === 'magazine' && product.issueNumber}
							<p class="mb-1 text-xs font-bold uppercase tracking-widest text-[#5C9B19]">
								Issue {product.issueNumber}
							</p>
						{/if}
						<h3 class="text-xl font-bold text-[#17200f]">{product.title}</h3>
						<p class="mt-2 flex-1 text-sm leading-relaxed text-[#17200f]/60">
							{product.description}
						</p>

						<div class="mt-4 flex items-end justify-between border-t border-black/5 pt-4">
							<Price amountGBP={product.price} {currency} {rate} size="md" />
							<button
								type="button"
								disabled={sold}
								onclick={() => addToCart(product)}
								class="inline-flex items-center gap-1.5 rounded-full bg-[#5C9B19] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#4c8316] disabled:cursor-not-allowed disabled:opacity-40"
							>
								{storeCart.has(product.slug.current) ? 'Add another' : 'Add to cart'}
							</button>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if filtered.length === 0}
			<p class="py-16 text-center text-sm text-[#17200f]/50">Nothing here yet — check back soon.</p>
		{/if}
	</div>
</section>