<script lang="ts">
	import SeoHead from '../../../components/SeoHead.svelte';
	import { urlFor } from '$lib/sanity/client';
	import { ArrowLeft, Clock3, ArrowUpRight } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { PortableText } from '@portabletext/svelte';
	import PtH2 from '../../../components/portable-text/PtH2.svelte';
	import PtH3 from '../../../components/portable-text/PtH3.svelte';
	import PtParagraph from '../../../components/portable-text/PtParagraph.svelte';
	import PtQuote from '../../../components/portable-text/PtQuote.svelte';
	import PtImage from '../../../components/portable-text/PtImage.svelte';

	const ptComponents = {
		block: {
			h2: PtH2,
			h3: PtH3,
			blockquote: PtQuote,
			normal: PtParagraph,
			h1: PtH2,
			h4: PtH3,
			h5: PtH3,
			h6: PtH3
		},
		types: { image: PtImage }
	};

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const article = $derived(data.article);
	const related = $derived(data.related ?? []);

	const categoryColor: Record<string, string> = {
		Guide: '#5C9B19',
		Food: '#F98315',
		Culture: '#17200f',
		Tips: '#3B82F6',
		Story: '#A855F7'
	};

	const coverImageUrl = $derived(
		article.image ? urlFor(article.image).width(1600).height(900).url() : ''
	);

	const seoTitle = $derived(article.seo?.metaTitle ?? `${article.title} | Gidi Tour`);
	const seoDescription = $derived(article.seo?.metaDescription ?? article.excerpt);
	const seoImage = $derived(
		article.seo?.ogImage
			? urlFor(article.seo.ogImage).width(1200).height(630).url()
			: coverImageUrl || data.siteSettings?.defaultSeo?.ogImage
	);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}

	const jsonLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: article.title,
		description: article.excerpt,
		image: coverImageUrl,
		datePublished: article.date,
		about: article.destination,
		author: { '@type': 'Organization', name: 'Gidi Tour' },
		publisher: { '@type': 'Organization', name: 'Gidi Tour' },
		mainEntityOfPage: `https://www.giditour.com/stories/${article.slug.current}`
	});
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url={`https://www.giditour.com/stories/${article.slug.current}`}
	siteName={data.siteSettings?.siteName}
/>

<svelte:head>
	<meta property="og:type" content="article" />
	{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<!-- HERO -->
<section class="relative">
	<div class="relative h-[60vh] min-h-85 w-full overflow-hidden sm:h-[70vh]">
		{#if coverImageUrl}
			<img
				src={coverImageUrl}
				alt={article.title}
				class="absolute inset-0 h-full w-full object-cover"
			/>
		{/if}
		<div
			class="absolute inset-0 bg-linear-to-t from-[#17200f]/90 via-[#17200f]/20 to-transparent"
		></div>
	</div>

	<div class="relative mx-auto -mt-64 max-w-3xl px-5 sm:px-8 lg:px-0">
		<a
			href="/stories"
			class="mb-4 inline-flex items-center gap-1.5 text-xs py-3 font-bold text-white/90 transition hover:text-white"
		>
			<ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
			Travel Journal
		</a>

		<span
			class="mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-bold capitalize text-white shadow"
			style="background-color: {categoryColor[article.category] ?? '#5C9B19'};"
		>
			{article.category}
		</span>

		<h1
			class="font-bold text-3xl leading-[1.1] tracking-[-.02em] text-white sm:text-4xl lg:text-5xl"
		>
			{article.title}
		</h1>

		<div class="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/70">
			{#if article.destination}
				<span>{article.destination}</span>
				<span class="h-1 w-1 rounded-full bg-white/40"></span>
			{/if}
			<span>{formatDate(article.date)}</span>
			{#if article.readTime}
				<span class="h-1 w-1 rounded-full bg-white/40"></span>
				<span class="flex items-center gap-1"
					><Clock3 class="h-3.5 w-3.5" aria-hidden="true" />{article.readTime} min read</span
				>
			{/if}
		</div>
	</div>
</section>

<!-- BODY -->
<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-0">
	<div class="mx-auto max-w-3xl">
		<div class="rounded-[28px] bg-white p-6 shadow-sm sm:p-10 lg:p-14">
			<p class="text-lg leading-relaxed text-[#17200f]/70">{article.excerpt}</p>

			{#if article.body?.length}
				<div class="prose-article mt-8">
					<PortableText value={article.body} components={ptComponents} />
				</div>
			{/if}

			<div class="mt-10 flex flex-wrap items-center gap-4 border-t border-black/10 pt-8">
				<a
					href="/book"
					class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
				>
					Plan a trip {#if article.destination}
						to {article.destination.split(',')[0]}{/if}
					<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
				</a>
			</div>
		</div>
	</div>
</section>

<!-- RELATED -->
{#if related.length > 0}
	<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-360">
			<h2 class="font-display text-2xl tracking-[-.02em] text-[#17200f] sm:text-3xl">
				More like this
			</h2>

			<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each related as item (item.slug.current)}
					<a
						href={`/stories/${item.slug.current}`}
						class="group relative overflow-hidden rounded-[22px] bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(23,32,15,0.25)]"
					>
						<div class="relative aspect-4/3 overflow-hidden">
							{#if item.image}
								<img
									src={urlFor(item.image).width(500).height(375).url()}
									alt={item.title}
									class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
									loading="lazy"
								/>
							{/if}
						</div>
						<div class="p-5">
							{#if item.destination}
								<p class="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17200f]/40">
									{item.destination}
								</p>
							{/if}
							<h3 class="font-display text-lg leading-snug text-[#17200f]">{item.title}</h3>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</section>
{/if}