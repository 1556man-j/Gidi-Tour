<script lang="ts">
	import { ArrowLeft, Check, Download, Minus, Plus, Truck } from 'lucide-svelte';
	import { PortableText } from '@portabletext/svelte';
	import { storeCart } from '$lib/stores/storeCart.svelte';
	import { urlFor } from '$lib/sanity/client';
	import { isFreeProduct, effectivePrice } from '$lib/storePricing';
	import SeoHead from '../../../components/SeoHead.svelte';
	import Price from '../../../components/Price.svelte';
	import StoreProductCard from '../../../components/StoreProductCard.svelte';
	import PtH3 from '../../../components/portable-text/PtH3.svelte';
	import PtParagraph from '../../../components/portable-text/PtParagraph.svelte';
	import PtQuote from '../../../components/portable-text/PtQuote.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ptComponents = {
		block: {
			h3: PtH3,
			blockquote: PtQuote,
			normal: PtParagraph
		}
	};

	const product = $derived(data.product);
	const currency = $derived(data.currency);
	const rate = $derived(data.rate);

	const free = $derived(isFreeProduct(product));
	const isMagazine = $derived(product.category === 'magazine');
	const hasVariants = $derived(Boolean(product.variants?.length));

	// Main image first, then any extra gallery photos.
	const images = $derived(
		[
			product.image ? { source: product.image, alt: product.title } : null,
			...(product.gallery ?? []).map((g) => ({ source: g, alt: g.alt || product.title }))
		].filter((i): i is { source: any; alt: string } => i !== null)
	);

	let activeIndex = $state(0);
	let selectedVariant = $state('');
	let quantity = $state(1);
	let needsVariant = $state(false);

	// Start fresh when moving to another product (for example from "You might also like").
	$effect(() => {
		product._id;
		activeIndex = 0;
		selectedVariant = '';
		quantity = 1;
		needsVariant = false;
	});

	const soldOut = $derived(
		product.category === 'merchandise' &&
			(hasVariants
				? product.variants!.every((v) => (v.stock ?? 0) <= 0)
				: (product.stock ?? 0) <= 0)
	);

	const maxQuantity = $derived.by(() => {
		if (isMagazine) return 1;
		const stock = hasVariants
			? (product.variants!.find((v) => v.label === selectedVariant)?.stock ?? 10)
			: (product.stock ?? 10);
		return Math.max(1, Math.min(10, stock));
	});

	const inCart = $derived(storeCart.has(product.slug.current, selectedVariant || undefined));

	function add() {
		if (soldOut) return;

		if (hasVariants && !selectedVariant) {
			needsVariant = true;
			return;
		}

		needsVariant = false;

		storeCart.add(
			{
				id: product.slug.current,
				category: product.category,
				title: product.title,
				price: effectivePrice(product),
				image: product.image ? urlFor(product.image).width(200).height(200).url() : '',
				variant: selectedVariant || undefined
			},
			isMagazine ? 1 : quantity
		);

		window.dispatchEvent(new CustomEvent('gt-cart-open'));
	}

	const publishedLabel = $derived(
		product.publishDate
			? new Date(product.publishDate).toLocaleDateString('en-GB', {
					month: 'long',
					year: 'numeric'
				})
			: ''
	);

	const seoImage = $derived(product.image as { asset: { _ref: string } } | undefined);
	const url = $derived(`https://giditour.com/store/${product.slug.current}`);

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Product',
			name: product.title,
			description: product.description,
			image: product.image ? [urlFor(product.image).width(1200).url()] : undefined,
			sku: product.sku || product.slug.current,
			url,
			offers: {
				'@type': 'Offer',
				url,
				priceCurrency: 'GBP',
				price: effectivePrice(product),
				availability: soldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
			}
		}).replace(/</g, '\\u003c')
	);
</script>

<SeoHead
	title={`${product.title} | Gidi Tour Store`}
	description={product.description?.slice(0, 160)}
	image={seoImage}
	{url}
	siteName={data.siteSettings?.siteName}
/>

<svelte:head>
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<section class="bg-[#f7f3ea] px-5 pb-20 pt-24 sm:px-8 lg:px-12 ">
	<div class="mx-auto max-w-360">
		<a
			href="/store"
			class="inline-flex items-center gap-2 text-sm font-semibold text-[#17200f]/60 transition hover:text-[#17200f]"
		>
			<ArrowLeft class="h-4 w-4" aria-hidden="true" />
			Back to store
		</a>

		<div class="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
			<!-- GALLERY -->
			<div class="lg:sticky lg:top-24 lg:self-start">
				<div class="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#ece6d6]">
					{#if images[activeIndex]}
						<img
							src={urlFor(images[activeIndex].source).width(1100).height(1375).fit('crop').url()}
							alt={images[activeIndex].alt}
							class="h-full w-full object-cover"
						/>
					{/if}
					{#if free}
						<span
							class="absolute left-4 top-4 rounded-full bg-[#5C9B19] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white shadow"
						>
							Free
						</span>
					{/if}
					{#if soldOut}
						<span
							class="absolute right-4 top-4 rounded-full bg-black/75 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white"
						>
							Sold out
						</span>
					{/if}
				</div>

				{#if images.length > 1}
					<div class="mt-4 grid grid-cols-5 gap-3 sm:grid-cols-6">
						{#each images as image, i}
							<button
								type="button"
								onclick={() => (activeIndex = i)}
								aria-label="Show photo {i + 1} of {images.length}"
								aria-current={i === activeIndex}
								class="aspect-square overflow-hidden rounded-2xl border-2 bg-[#ece6d6] transition {i ===
								activeIndex
									? 'border-[#5C9B19]'
									: 'border-transparent opacity-70 hover:opacity-100'}"
							>
								<img
									src={urlFor(image.source).width(200).height(200).fit('crop').url()}
									alt=""
									class="h-full w-full object-cover"
									loading="lazy"
								/>
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- INFO -->
			<div>
				<p class="text-xs font-bold uppercase tracking-widest text-[#5C9B19]">
					{#if isMagazine}
						Digital issue{product.issueNumber ? ` · Issue ${product.issueNumber}` : ''}
					{:else}
						Travel merchandise
					{/if}
				</p>

				<h1
					class="mt-3 text-4xl font-bold leading-[1.05] tracking-[-.02em] text-[#17200f] sm:text-5xl"
				>
					{product.title}
				</h1>

				{#if publishedLabel}
					<p class="mt-2 text-sm text-[#17200f]/50">Published {publishedLabel}</p>
				{/if}

				<div class="mt-5">
					{#if free}
						<span class="text-3xl font-bold text-[#5C9B19]">Free</span>
					{:else}
						<Price amountGBP={product.price} {currency} {rate} size="lg" />
					{/if}
				</div>

				<p class="mt-5 text-base leading-relaxed text-[#17200f]/70">{product.description}</p>

				<!-- Variants -->
				{#if hasVariants}
					<div class="mt-7">
						<p class="text-sm font-bold text-[#17200f]">
							Choose an option
							{#if selectedVariant}<span class="font-normal text-[#17200f]/60"
									>· {selectedVariant}</span
								>{/if}
						</p>
						<div class="mt-3 flex flex-wrap gap-2">
							{#each product.variants ?? [] as variant}
								{@const out = (variant.stock ?? 0) <= 0}
								<button
									type="button"
									disabled={out}
									onclick={() => {
										selectedVariant = variant.label;
										needsVariant = false;
										quantity = 1;
									}}
									class="rounded-full border px-5 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:line-through disabled:opacity-40 {selectedVariant ===
									variant.label
										? 'border-[#17200f] bg-[#17200f] text-white'
										: 'border-black/15 bg-white text-[#17200f] hover:border-black/40'}"
								>
									{variant.label}
								</button>
							{/each}
						</div>
						{#if needsVariant}
							<p class="mt-2 text-sm font-semibold text-red-600">Please choose an option first.</p>
						{/if}
					</div>
				{/if}

				<!-- Quantity + add -->
				<div class="mt-8 flex flex-wrap items-center gap-4">
					{#if !isMagazine}
						<div class="flex items-center rounded-full border border-black/15 bg-white">
							<button
								type="button"
								onclick={() => (quantity = Math.max(1, quantity - 1))}
								disabled={quantity <= 1}
								aria-label="Decrease quantity"
								class="flex h-12 w-12 items-center justify-center rounded-full text-[#17200f] transition hover:bg-black/5 disabled:opacity-30"
							>
								<Minus class="h-4 w-4" aria-hidden="true" />
							</button>
							<span class="w-8 text-center text-sm font-bold" aria-live="polite">{quantity}</span>
							<button
								type="button"
								onclick={() => (quantity = Math.min(maxQuantity, quantity + 1))}
								disabled={quantity >= maxQuantity}
								aria-label="Increase quantity"
								class="flex h-12 w-12 items-center justify-center rounded-full text-[#17200f] transition hover:bg-black/5 disabled:opacity-30"
							>
								<Plus class="h-4 w-4" aria-hidden="true" />
							</button>
						</div>
					{/if}

					<button
						type="button"
						onclick={add}
						disabled={soldOut}
						class="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-8 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
					>
						{#if soldOut}
							Sold out
						{:else if inCart && isMagazine}
							<Check class="h-4 w-4" aria-hidden="true" /> In your cart
						{:else if free}
							Get for free
						{:else}
							Add to cart
						{/if}
					</button>
				</div>

				<!-- Delivery note -->
				<div class="mt-6 flex items-start gap-3 rounded-2xl bg-white p-4 text-sm text-[#17200f]/70">
					{#if isMagazine}
						<Download class="mt-0.5 h-5 w-5 shrink-0 text-[#5C9B19]" aria-hidden="true" />
						<p>
							{free
								? 'Enter your name and email at checkout and we will email you the download link. No payment needed.'
								: 'Your download link is emailed as soon as your payment is confirmed, and you can download it again from your account.'}
						</p>
					{:else}
						<Truck class="mt-0.5 h-5 w-5 shrink-0 text-[#5C9B19]" aria-hidden="true" />
						<p>This item ships to you. You will enter your delivery address at checkout.</p>
					{/if}
				</div>

				<!-- Highlights -->
				{#if product.highlights?.length}
					<ul class="mt-8 space-y-3">
						{#each product.highlights as highlight}
							<li class="flex items-start gap-3 text-[15px] text-[#17200f]/80">
								<Check class="mt-0.5 h-5 w-5 shrink-0 text-[#5C9B19]" aria-hidden="true" />
								<span>{highlight}</span>
							</li>
						{/each}
					</ul>
				{/if}

				<!-- Full details -->
				{#if product.details?.length}
					<div class="mt-10 border-t border-black/10 pt-8">
						<h2 class="mb-4 text-xl font-bold text-[#17200f]">About this product</h2>
						<PortableText value={product.details as any} components={ptComponents} />
					</div>
				{/if}

				<!-- Specs -->
				{#if product.specs?.length}
					<div class="mt-8 border-t border-black/10 pt-8">
						<h2 class="mb-4 text-xl font-bold text-[#17200f]">Specifications</h2>
						<dl class="divide-y divide-black/10 rounded-2xl bg-white px-5">
							{#each product.specs as spec}
								<div class="flex justify-between gap-6 py-3 text-sm">
									<dt class="text-[#17200f]/60">{spec.label}</dt>
									<dd class="text-right font-semibold text-[#17200f]">{spec.value}</dd>
								</div>
							{/each}
						</dl>
					</div>
				{/if}
			</div>
		</div>

		<!-- Related -->
		{#if data.related.length > 0}
			<div class="mt-20 border-t border-black/10 pt-12">
				<h2 class="text-2xl font-bold text-[#17200f]">You might also like</h2>
				<div class="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6">
					{#each data.related as item (item.slug.current)}
						<StoreProductCard product={item} {currency} {rate} />
					{/each}
				</div>
			</div>
		{/if}
	</div>
</section>
