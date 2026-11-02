<script lang="ts">
	import { PawPrint } from 'lucide-svelte';
	import { urlFor } from '$lib/sanity/client';
	import GidiCareProgress from './GidiCareProgress.svelte';
	import type { GidiCareCase } from '$lib/sanity/queries/gidicare';

	interface Props {
		item: GidiCareCase & { raisedGBP: number };
	}

	let { item }: Props = $props();

	const label = $derived(
		item.status === 'active'
			? 'Needs help'
			: item.status === 'funded'
				? 'Fully funded'
				: 'Recovered'
	);
</script>

<article class="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
	<div class="relative aspect-[4/3] overflow-hidden bg-[#ece6d6]">
		{#if item.photo}
			<img
				src={urlFor(item.photo).width(800).height(600).fit('crop').url()}
				alt={item.photo.alt || item.title}
				class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
				loading="lazy"
			/>
		{:else}
			<div class="flex h-full w-full items-center justify-center text-[#5C9B19]/40">
				<PawPrint class="h-16 w-16" aria-hidden="true" />
			</div>
		{/if}

		<span
			class="absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm {item.status ===
			'active'
				? 'bg-[#F98315] text-white'
				: 'bg-white/95 text-[#17200f]/70'}"
		>
			{label}
		</span>
	</div>

	<div class="flex flex-1 flex-col p-5">
		<h3 class="text-lg font-bold leading-snug text-[#17200f]">
			<a href={`/gidicare/${item.slug.current}`} class="after:absolute after:inset-0 after:content-['']">
				{item.title}
			</a>
		</h3>

		{#if item.location}
			<p class="mt-1 text-xs font-semibold uppercase tracking-wider text-[#17200f]/45">{item.location}</p>
		{/if}

		{#if item.summary}
			<p class="mt-2 line-clamp-3 text-sm leading-relaxed text-[#17200f]/65">{item.summary}</p>
		{/if}

		<div class="mt-auto pt-4">
			<GidiCareProgress raisedGBP={item.raisedGBP} goalGBP={item.goalGBP} />
		</div>
	</div>
</article>
