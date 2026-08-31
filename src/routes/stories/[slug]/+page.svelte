<script lang="ts">
	import { page } from '$app/state';
	import { error } from '@sveltejs/kit';
	import { getArticleBySlug, getRelatedArticles, categoryColor } from '$lib/data/articles';
	import { ArrowLeft, Clock3, ArrowUpRight } from 'lucide-svelte';

	const slug = $derived(page.params.slug);
	const article = $derived(getArticleBySlug(slug));

	if (!article) {
		throw error(404, 'Article not found');
	}

	const related = $derived(article ? getRelatedArticles(article) : []);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}

	const jsonLd = $derived(
		article
			? {
					'@context': 'https://schema.org',
					'@type': 'BlogPosting',
					headline: article.title,
					description: article.excerpt,
					image: article.image,
					datePublished: article.date,
					about: article.destination,
					author: { '@type': 'Organization', name: 'Gidi Tour' },
					publisher: { '@type': 'Organization', name: 'Gidi Tour' },
					mainEntityOfPage: `https://www.giditour.com/stories/${article.slug}`
				}
			: null
	);
</script>

<svelte:head>
	<title>{article ? `${article.title} | Gidi Tour` : 'Gidi Tour'}</title>
	{#if article}
		<meta name="description" content={article.excerpt} />
		<link rel="canonical" href={`https://www.giditour.com/stories/${article.slug}`} />
		<meta property="og:type" content="article" />
		<meta property="og:title" content={article.title} />
		<meta property="og:description" content={article.excerpt} />
		<meta property="og:image" content={article.image} />
		<meta name="twitter:card" content="summary_large_image" />
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
	{/if}
</svelte:head>

{#if article}
	<!-- HERO -->
	<section class="relative ">
		<div class="relative h-[60vh] min-h-85 w-full overflow-hidden sm:h-[70vh]">
			<img src={article.image} alt={article.title} class="absolute inset-0 h-full w-full object-cover" />
			<div class="absolute inset-0 bg-linear-to-t from-[#17200f]/90 via-[#17200f]/20 to-transparent"></div>
		</div>

		<div class="relative mx-auto -mt-54 max-w-3xl px-5 sm:px-8 lg:px-0">
			<a
				href="/stories"
				class="mb-4 inline-flex items-center gap-1.5 text-xs py-3  font-bold text-white/90 transition hover:text-white"
			>
				<ArrowLeft class="h-3.5 w-3.5" aria-hidden="true" />
				Travel Journal
			</a>

			<span
				class="mb-4 inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-bold capitalize  text-white shadow"
				style="background-color: {categoryColor[article.category]};"
			>
				{article.category}
			</span>

			<h1 class="font-bold text-3xl leading-[1.1] tracking-[-.02em] text-white sm:text-4xl lg:text-5xl">
				{article.title}
			</h1>

			<div class="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/70">
				<span>{article.destination}</span>
				<span class="h-1 w-1 rounded-full bg-white/40"></span>
				<span>{formatDate(article.date)}</span>
				<span class="h-1 w-1 rounded-full bg-white/40"></span>
				<span class="flex items-center gap-1"><Clock3 class="h-3.5 w-3.5" aria-hidden="true" />{article.readTime} min read</span>
			</div>
		</div>
	</section>

	<!-- BODY -->
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-0 lg:py-24">
		<div class="mx-auto max-w-3xl">
			<div class="rounded-[28px] bg-white p-6 shadow-sm sm:p-10 lg:p-14">
				<p class="text-lg leading-relaxed text-[#17200f]/70">{article.excerpt}</p>

				<div class="mt-8 flex flex-col gap-6">
					{#each article.content as paragraph, i (i)}
						<p class="text-[16px] leading-[1.8] text-[#17200f]/80">{paragraph}</p>
					{/each}
				</div>

				<div class="mt-10 flex flex-wrap items-center gap-4 border-t border-black/10 pt-8">
					<a
						href="/book"
						class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
					>
						Plan a trip to {article.destination.split(',')[0]}
						<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- RELATED -->
	{#if related.length > 0}
		<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
			<div class="mx-auto max-w-[1440px]">
				<h2 class="font-display text-2xl tracking-[-.02em] text-[#17200f] sm:text-3xl">More like this</h2>

				<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{#each related as item (item.slug)}
						<a
							href={`/stories/${item.slug}`}
							class="group relative overflow-hidden rounded-[22px] bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(23,32,15,0.25)]"
						>
							<div class="relative aspect-[4/3] overflow-hidden">
								<img
									src={item.image}
									alt={item.title}
									class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
									loading="lazy"
								/>
							</div>
							<div class="p-5">
								<p class="mb-2 text-[10px] font-bold uppercase tracking-[.16em] text-[#17200f]/40">
									{item.destination}
								</p>
								<h3 class="font-display text-lg leading-snug text-[#17200f]">{item.title}</h3>
							</div>
						</a>
					{/each}
				</div>
			</div>
		</section>
	{/if}
{/if}