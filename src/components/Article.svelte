<script lang="ts">
	import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { urlFor } from '$lib/sanity/client';
	import type { SanityArticle } from '$lib/sanity/queries/articles';

	interface Props {
		articles: SanityArticle[];
	}

	let { articles }: Props = $props();

	const storyList = $derived(articles.slice(0, 5));

	let storyTrack: HTMLDivElement | undefined;

	function scrollStories(dir: number) {
		const track = storyTrack;
		if (!track) return;
		const maxScroll = track.scrollWidth - track.clientWidth;
		const atEnd = track.scrollLeft >= maxScroll - 4;
		const atStart = track.scrollLeft <= 4;

		if (dir > 0 && atEnd) {
			track.scrollTo({ left: 0, behavior: 'smooth' });
		} else if (dir < 0 && atStart) {
			track.scrollTo({ left: maxScroll, behavior: 'smooth' });
		} else {
			track.scrollBy({ left: dir * 300, behavior: 'smooth' });
		}
	}

	let storyActiveDot = $state(0);
	function updateStoryActiveDot() {
		const track = storyTrack;
		if (!track) return;
		const maxScroll = track.scrollWidth - track.clientWidth;
		if (maxScroll <= 0) {
			storyActiveDot = 0;
			return;
		}
		const ratio = track.scrollLeft / maxScroll;
		storyActiveDot = Math.round(ratio * (storyList.length - 1));
	}
	function goToStoryDot(i: number) {
		const track = storyTrack;
		if (!track) return;
		const maxScroll = track.scrollWidth - track.clientWidth;
		track.scrollTo({
			left: maxScroll * (i / (storyList.length - 1 || 1)),
			behavior: 'smooth'
		});
	}
</script>

{#if storyList.length > 0}
	<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
		<div class="mx-auto max-w-[1440px]">
			<div class="reveal grid gap-8 lg:grid-cols-12 lg:items-end">
				<div class="lg:col-span-7">
					<p class="text-[17px] font-bold capitalize text-[#F98315]">Stories from the road</p>
					<h2 class="font-display mt-3 text-5xl leading-[.9] tracking-[-.04em] sm:text-6xl">
						Go curious.<br /><span class="text-[#5C9B19]">Come back changed.</span>
					</h2>
				</div>
				<div class="flex items-center justify-between gap-4 lg:col-span-4 lg:col-start-9 lg:justify-end">
					<p class="max-w-md text-sm leading-6 text-black/55">
						Real trips, real people. Dispatches, guides and lessons from the road, written by the ones
						who went.
					</p>
				</div>
			</div>

			<div class="mt-4 flex justify-end">
				<a href="/stories" class="hidden text-xs font-bold text-[#5C9B19] sm:block">Read all stories →</a>
			</div>

			<div class="mt-8 flex items-center gap-4">
				<button
					type="button"
					class="hidden md:flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[#5C9B19] shadow-md text-white hover:scale-110 transition"
					onclick={() => scrollStories(-1)}
					aria-label="Previous story"
				>
					<ChevronLeft class="w-5 h-5" aria-hidden="true" />
				</button>

				<div class="story__track" bind:this={storyTrack} onscroll={updateStoryActiveDot}>
					{#each storyList as story (story.slug.current)}
						<a
							href={`/stories/${story.slug.current}`}
							class="story__card group relative min-w-70 overflow-hidden rounded-[22px] border border-black/5 sm:min-w-85 lg:min-w-95 lg:flex-1"
						>
							{#if story.image}
								<img
									src={urlFor(story.image).width(700).height(500).url()}
									alt={story.title}
									class="h-47.5 w-full object-cover opacity-90 transition duration-700 group-hover:scale-105 group-hover:opacity-100 sm:h-52.5 lg:h-57.5"
									loading="lazy"
								/>
							{/if}
							<div class="absolute inset-0 bg-linear-to-t from-black/75 to-black/40 "></div>
							<div class="absolute inset-x-0 bottom-0 p-5">
								{#if story.destination}
									<p class="mb-2 text-[10px] font-bold uppercase  text-[#F98315]">
										{story.destination}
									</p>
								{/if}
								<h3 class="font-display text-xl leading-tight text-white">{story.title}</h3>
								<p class="mt-3 flex items-center text-xs font-bold text-[#F98315]">
									Read story
									<ArrowRight class="ml-1 w-3.5 h-3.5" aria-hidden="true" />
								</p>
							</div>
						</a>
					{/each}
				</div>

				<button
					type="button"
					class="hidden md:flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[#5C9B19] shadow-md text-white hover:scale-110 transition"
					onclick={() => scrollStories(1)}
					aria-label="Next story"
				>
					<ChevronRight class="w-5 h-5" aria-hidden="true" />
				</button>
			</div>

			<div class="flex items-center justify-center gap-2 mt-8" role="tablist" aria-label="Choose story">
				{#each storyList as story, i (story.slug.current)}
					<button
						type="button"
						class="story__dot"
						class:story__dot--active={i === storyActiveDot}
						role="tab"
						aria-selected={i === storyActiveDot}
						aria-label="Go to story {i + 1}"
						onclick={() => goToStoryDot(i)}
					></button>
				{/each}
			</div>
		</div>
	</section>
{/if}

<style>
	.story__track {
		display: flex;
		gap: 16px;
		min-width: 0;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		padding: 4px 4px 8px;
	}
	.story__track::-webkit-scrollbar {
		display: none;
	}

	.story__card {
		flex-shrink: 0;
		scroll-snap-align: start;
		transition: transform 160ms ease;
	}
	.story__card:hover {
		transform: translateY(-2px);
	}
	.story__dot {
		width: 9px;
		height: 9px;
		padding: 0;
		border: none;
		box-sizing: border-box;
		border-radius: 99px;
		background: #82818133;
		cursor: pointer;
		transition:
			width 0.2s ease,
			background-color 0.2s ease;
	}
	.story__dot--active {
		width: 19px;
		background: #f98315;
	}
	.story__dot:focus-visible {
		outline: 2px solid #f98315;
		outline-offset: 2px;
	}
</style>