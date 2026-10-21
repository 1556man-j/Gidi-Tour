<script lang="ts">
	import { ArrowUpRight, Check, Plus } from 'lucide-svelte';
	import { storeCart } from '$lib/stores/storeCart.svelte';
	import { urlFor } from '$lib/sanity/client';
	import { isFreeProduct, effectivePrice } from '$lib/storePricing';
	import Price from './Price.svelte';
	import type { StoreProduct } from '$lib/sanity/queries/store';
	import type { CurrencyInfo } from '$lib/currency/countryCurrency';

	interface Props {
		product: StoreProduct;
		currency: CurrencyInfo;
		rate: number | null;
	}

	let { product, currency, rate }: Props = $props();

	const href = $derived(`/store/${product.slug.current}`);
	const free = $derived(isFreeProduct(product));
	const hasVariants = $derived(Boolean(product.variants?.length));
	const inCart = $derived(storeCart.has(product.slug.current));

	const soldOut = $derived(
		product.category === 'merchandise' &&
			(hasVariants
				? product.variants!.every((v) => (v.stock ?? 0) <= 0)
				: (product.stock ?? 0) <= 0)
	);

	function quickAdd() {
		storeCart.add(
			{
				id: product.slug.current,
				category: product.category,
				title: product.title,
				price: effectivePrice(product),
				image: product.image ? urlFor(product.image).width(200).height(200).url() : ''
			},
			1
		);
		window.dispatchEvent(new CustomEvent('gt-cart-open'));
	}
</script>

<article class="group relative flex flex-col">
	<div class="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#ece6d6]">
		{#if product.image}
			<img
				src={urlFor(product.image).width(640).height(800).fit('crop').url()}
				alt={product.title}
				class="h-full w-full object-cover transition duration-500 group-hover:scale-105 {soldOut
					? 'opacity-60'
					: ''}"
				loading="lazy"
			/>
		{/if}

		<div class="absolute left-3 top-3 flex flex-col items-start gap-1.5">
			<span
				class="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#17200f]/70 shadow-sm"
			>
				{product.category === 'magazine' ? 'Digital issue' : 'Merch'}
			</span>
			{#if free}
				<span
					class="rounded-full bg-[#5C9B19] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm"
				>
					Free
				</span>
			{/if}
		</div>

		{#if soldOut}
			<span
				class="absolute right-3 top-3 rounded-full bg-black/75 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
			>
				Sold out
			</span>
		{:else if hasVariants}
			<!-- Needs a size or option first, so it opens the product page. -->
			<a
				{href}
				aria-label="Choose options for {product.title}"
				class="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#17200f] shadow-lg transition hover:bg-[#5C9B19] hover:text-white"
			>
				<ArrowUpRight class="h-5 w-5" aria-hidden="true" />
			</a>
		{:else}
			<button
				type="button"
				onclick={quickAdd}
				aria-label={inCart ? `${product.title} is in your cart` : `Add ${product.title} to cart`}
				class="absolute bottom-3 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition {inCart
					? 'bg-[#5C9B19] text-white'
					: 'bg-white text-[#17200f] hover:bg-[#5C9B19] hover:text-white'}"
			>
				{#if inCart}
					<Check class="h-5 w-5" aria-hidden="true" />
				{:else}
					<Plus class="h-5 w-5" aria-hidden="true" />
				{/if}
			</button>
		{/if}
	</div>

	<div class="mt-4 px-1">
		{#if product.category === 'magazine' && product.issueNumber}
			<p class="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#5C9B19]">
				Issue {product.issueNumber}
			</p>
		{/if}

		<h3 class="text-lg font-bold leading-snug text-[#17200f]">
			<!-- The link stretches over the whole card, so the entire card is clickable. -->
			<a {href} class="after:absolute after:inset-0 after:content-['']">{product.title}</a>
		</h3>

		<p class="mt-1 line-clamp-2 text-sm leading-relaxed text-[#17200f]/60">
			{product.description}
		</p>

		<div class="mt-3">
			{#if free}
				<span class="text-lg font-bold text-[#5C9B19]">Free</span>
			{:else}
				<Price amountGBP={product.price} {currency} {rate} size="md" />
			{/if}
		</div>
	</div>
</article>
