<script lang="ts">
	import { ArrowLeft, MapPin, PawPrint, ShieldCheck } from 'lucide-svelte';
	import { PortableText } from '@portabletext/svelte';
	import { urlFor } from '$lib/sanity/client';
	import SeoHead from '../../../components/SeoHead.svelte';
	import GidiCareDonate from '../../../components/GidiCareDonate.svelte';
	import GidiCareProgress from '../../../components/GidiCareProgress.svelte';
	import PtH3 from '../../../components/portable-text/PtH3.svelte';
	import PtParagraph from '../../../components/portable-text/PtParagraph.svelte';
	import PtQuote from '../../../components/portable-text/PtQuote.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ptComponents = {
		block: { h3: PtH3, blockquote: PtQuote, normal: PtParagraph }
	};

	const item = $derived(data.item);

	const images = $derived(
		[
			item.photo ? { source: item.photo, alt: item.photo.alt || item.title } : null,
			...(item.gallery ?? []).map((g) => ({ source: g, alt: g.alt || item.title }))
		].filter((i): i is { source: any; alt: string } => i !== null)
	);

	let activeIndex = $state(0);

	const statusText = $derived(
		item.status === 'active'
			? 'Needs help now'
			: item.status === 'funded'
				? 'Fully funded. Thank you!'
				: 'Recovered. Thank you!'
	);

	const legal = $derived(
		data.legalNotice ||
			'GidiCare is an initiative of Gidi Tour. Donations are voluntary gifts to support animal care. If you have questions about how funds are used, please contact us.'
	);
</script>

<SeoHead
	title={`${item.title} | GidiCare`}
	description={item.summary}
	image={item.photo}
	url={`https://giditour.com/gidicare/${item.slug.current}`}
	siteName={data.siteSettings?.siteName}
/>

<section class="bg-[#f7f3ea] px-5 pb-20 pt-10 sm:px-8 lg:px-12 lg:pt-14">
	<div class="mx-auto max-w-[1200px]">
		<a
			href="/gidicare"
			class="inline-flex items-center gap-2 text-sm font-semibold text-[#17200f]/60 transition hover:text-[#17200f]"
		>
			<ArrowLeft class="h-4 w-4" aria-hidden="true" />
			All animals
		</a>

		<div class="mt-6 grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:gap-14">
			<!-- STORY -->
			<div>
				<div class="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#ece6d6]">
					{#if images[activeIndex]}
						<img
							src={urlFor(images[activeIndex].source).width(1400).height(1050).fit('crop').url()}
							alt={images[activeIndex].alt}
							class="h-full w-full object-cover"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center text-[#5C9B19]/40">
							<PawPrint class="h-20 w-20" aria-hidden="true" />
						</div>
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

				<p
					class="mt-8 inline-block rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest {item.status ===
					'active'
						? 'bg-[#F98315] text-white'
						: 'bg-[#5C9B19]/15 text-[#3d6a10]'}"
				>
					{statusText}
				</p>

				<h1 class="mt-4 text-4xl font-bold leading-[1.05] tracking-[-.02em] text-[#17200f] sm:text-5xl">
					{item.title}
				</h1>

				{#if item.location}
					<p class="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#17200f]/55">
						<MapPin class="h-4 w-4" aria-hidden="true" />
						{item.location}
					</p>
				{/if}

				{#if item.summary}
					<p class="mt-5 text-lg leading-relaxed text-[#17200f]/75">{item.summary}</p>
				{/if}

				<div class="mt-6 max-w-md">
					<GidiCareProgress raisedGBP={data.raisedGBP} goalGBP={item.goalGBP} />
					{#if data.supporters > 0}
						<p class="mt-1 text-xs text-[#17200f]/50">
							{data.supporters}
							{data.supporters === 1 ? 'donation' : 'donations'} through the site
						</p>
					{/if}
				</div>

				{#if item.partnerName}
					<p class="mt-5 text-sm text-[#17200f]/60">
						Cared for by <strong class="text-[#17200f]">{item.partnerName}</strong>
					</p>
				{/if}

				{#if item.story?.length}
					<div class="mt-8 border-t border-black/10 pt-8">
						<PortableText value={item.story as any} components={ptComponents} />
					</div>
				{/if}

				{#if item.updates?.length}
					<div class="mt-10 border-t border-black/10 pt-8">
						<h2 class="text-2xl font-bold text-[#17200f]">Updates</h2>
						<ol class="mt-6 space-y-6">
							{#each item.updates as update (update._key)}
								<li class="rounded-2xl bg-white p-5">
									{#if update.date}
										<p class="text-xs font-bold uppercase tracking-widest text-[#5C9B19]">
											{new Date(update.date).toLocaleDateString('en-GB', {
												day: 'numeric',
												month: 'long',
												year: 'numeric'
											})}
										</p>
									{/if}
									{#if update.text}
										<p class="mt-2 text-[15px] leading-relaxed text-[#17200f]/75">{update.text}</p>
									{/if}
									{#if update.image}
										<img
											src={urlFor(update.image).width(900).url()}
											alt=""
											class="mt-4 w-full rounded-2xl"
											loading="lazy"
										/>
									{/if}
								</li>
							{/each}
						</ol>
					</div>
				{/if}
			</div>

			<!-- DONATE -->
			<div class="lg:sticky lg:top-24 lg:self-start">
				{#if item.status === 'active'}
					<GidiCareDonate
						caseSlug={item.slug.current}
						caseTitle={item.title}
						currency={data.currency}
						rate={data.rate}
						provider={data.paymentProvider}
						customer={data.customer}
						presets={data.presets}
						minGBP={data.minGBP}
						maxGBP={data.maxGBP}
					/>
				{:else}
					<div class="rounded-3xl bg-white p-8 text-center shadow-sm">
						<PawPrint class="mx-auto h-10 w-10 text-[#5C9B19]" aria-hidden="true" />
						<h2 class="mt-4 text-xl font-bold text-[#17200f]">Thank you to everyone who helped</h2>
						<p class="mt-2 text-sm text-[#17200f]/65">
							{item.title} is no longer collecting donations. You can help another animal instead.
						</p>
						<a
							href="/gidicare#donate"
							class="mt-6 inline-block rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
						>
							Support GidiCare
						</a>
					</div>
				{/if}

				<p class="mt-5 flex items-start gap-2 text-xs leading-relaxed text-[#17200f]/55">
					<ShieldCheck class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
					{legal}
				</p>
			</div>
		</div>
	</div>
</section>
