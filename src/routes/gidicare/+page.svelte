<script lang="ts">
	import { PawPrint, ShieldCheck } from 'lucide-svelte';
	import { urlFor } from '$lib/sanity/client';
	import SeoHead from '../../components/SeoHead.svelte';
	import GidiCareDonate from '../../components/GidiCareDonate.svelte';
	import GidiCareCaseCard from '../../components/GidiCareCaseCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const settings = $derived(data.settings);

	const title = $derived(settings?.heroTitle || 'Help a stray in need');
	const subtitle = $derived(
		settings?.heroSubtitle ||
			'GidiCare supports stray and injured cats, dogs and other animals with medical care, food and shelter. Your gift helps us care for them.'
	);
	const legal = $derived(
		settings?.legalNotice ||
			'GidiCare is an initiative of Gidi Tour. Donations are voluntary gifts to support animal care. If you have questions about how funds are used, please contact us.'
	);

	const gbp = new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP',
		maximumFractionDigits: 0
	});

	const hasStats = $derived(
		data.stats.raisedGBP > 0 || data.stats.supporters > 0 || data.stats.helped > 0
	);
</script>

<SeoHead
	title="GidiCare | Help stray and injured animals"
	description="Donate to GidiCare to help stray and injured cats, dogs and other animals get the care they need."
	image={settings?.heroImage}
	url="https://giditour.com/gidicare"
	siteName={data.siteSettings?.siteName}
/>

<!-- HERO -->
<section class="relative overflow-hidden px-5 pb-16 pt-24 text-black sm:px-8 lg:px-12 lg:pb-24 lg:pt-20">
	<!-- {#if settings?.heroImage}
		<img
			src={urlFor(settings.heroImage).width(1800).height(1000).fit('crop').url()}
			alt=""
			class="absolute inset-0 h-full w-full object-cover opacity-25"
		/>
	{/if}
	<div class="absolute inset-0"></div> -->

	<div class="relative mx-auto grid max-w-[1200px] items-start gap-12 lg:grid-cols-[1.1fr_.9fr] lg:gap-16">
		<div class="lg:pt-6">
			<p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#F98315]">
				<PawPrint class="h-4 w-4" aria-hidden="true" />
				GidiCare
			</p>
			<h1 class="mt-5 text-4xl font-bold leading-[1.05] tracking-[-.02em] sm:text-5xl lg:text-6xl">
				{title}
			</h1>
			<p class="mt-5 max-w-xl text-lg leading-relaxed text-black/75">{subtitle}</p>

			{#if hasStats}
				<dl class="mt-10 grid max-w-xl grid-cols-3 gap-4">
					{#if data.stats.raisedGBP > 0}
						<div class="rounded-2xl bg-white/10 p-4">
							<dt class="text-xs text-white/60">Raised</dt>
							<dd class="mt-1 text-2xl font-bold">{gbp.format(data.stats.raisedGBP)}</dd>
						</div>
					{/if}
					{#if data.stats.supporters > 0}
						<div class="rounded-2xl bg-white/10 p-4">
							<dt class="text-xs text-white/60">Donations</dt>
							<dd class="mt-1 text-2xl font-bold">{data.stats.supporters}</dd>
						</div>
					{/if}
					{#if data.stats.helped > 0}
						<div class="rounded-2xl bg-white/10 p-4">
							<dt class="text-xs text-white/60">Animals helped</dt>
							<dd class="mt-1 text-2xl font-bold">{data.stats.helped}</dd>
						</div>
					{/if}
				</dl>
			{/if}
		</div>

		<div id="donate">
			<GidiCareDonate
				currency={data.currency}
				rate={data.rate}
				provider={data.paymentProvider}
				customer={data.customer}
				presets={data.presets}
				minGBP={data.minGBP}
				maxGBP={data.maxGBP}
			/>
		</div>
	</div>
</section>

<!-- ABOUT -->
{#if settings?.intro}
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-3xl text-center">
			<p class="mt-5 text-xl leading-relaxed text-[#17200f]/80">{settings.intro}</p>
		</div>
	</section>
{/if}

<!-- ANIMALS WHO NEED HELP -->
{#if data.active.length > 0}
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-[1200px]">
			<h2 class="text-3xl font-bold tracking-[-.02em] text-[#17200f] sm:text-4xl">
				Animals who need help right now
			</h2>
			<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.active as item (item._id)}
					<GidiCareCaseCard {item} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- HOW DONATIONS ARE USED -->
{#if settings?.fundsUse?.length}
	<section class="bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-[1200px]">
			<h2 class="text-3xl font-bold tracking-[-.02em] text-[#17200f] sm:text-4xl">
				How your gift helps
			</h2>
			<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each settings.fundsUse as use (use._key)}
					<div class="rounded-3xl bg-[#f7f3ea] p-6">
						<h3 class="text-lg font-bold text-[#17200f]">{use.label}</h3>
						{#if use.description}
							<p class="mt-2 text-sm leading-relaxed text-[#17200f]/65">{use.description}</p>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- HAPPY ENDINGS -->
{#if data.helped.length > 0}
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12 lg:py-20">
		<div class="mx-auto max-w-[1200px]">
			<h2 class="text-3xl font-bold tracking-[-.02em] text-[#17200f] sm:text-4xl">
				Animals you have helped
			</h2>
			<div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.helped as item (item._id)}
					<GidiCareCaseCard {item} />
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- RECENT SUPPORTERS -->
{#if data.supporters.length > 0}
	<section class="bg-white px-5 py-12 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-[1200px] text-center">
			<h2 class="text-xl font-bold text-[#17200f]">Recent supporters</h2>
			<ul class="mt-5 flex flex-wrap justify-center gap-2">
				{#each data.supporters as supporter}
					<li class="rounded-full bg-[#f7f3ea] px-4 py-2 text-sm font-semibold text-[#17200f]/75">
						{supporter}
					</li>
				{/each}
			</ul>
		</div>
	</section>
{/if}

<!-- FAQ -->
{#if settings?.faqs?.length}
	<section class="bg-[#f7f3ea] px-5 py-16 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-3xl">
			<h2 class="text-3xl font-bold tracking-[-.02em] text-[#17200f]">Questions</h2>
			<div class="mt-8 space-y-3">
				{#each settings.faqs as faq (faq._key)}
					<details class="group rounded-2xl bg-white p-5">
						<summary class="cursor-pointer list-none font-bold text-[#17200f]">{faq.question}</summary>
						<p class="mt-3 text-sm leading-relaxed text-[#17200f]/70">{faq.answer}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>
{/if}

<!-- LEGAL -->
<section class="bg-[#f7f3ea] px-5 pb-16 sm:px-8 lg:px-12">
	<div class="mx-auto flex max-w-3xl items-start gap-3 text-xs leading-relaxed text-[#17200f]/55">
		<ShieldCheck class="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
		<p>{legal}</p>
	</div>
</section>
