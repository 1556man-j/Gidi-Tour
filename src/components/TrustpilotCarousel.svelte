<script lang="ts">
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
	import Autoplay from 'embla-carousel-autoplay';
	import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-svelte';
	import { urlFor } from '$lib/sanity/client';
	import type { SanityTrustpilotReview } from '$lib/sanity/queries/trustpilotReviews';

	interface Props {
		reviews: SanityTrustpilotReview[];
		trustpilotProfileUrl?: string;
	}

	let { reviews, trustpilotProfileUrl = 'https://www.trustpilot.com/review/giditour.com' }: Props = $props();

	const reduceMotion =
		typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	let emblaApi: EmblaCarouselType | undefined = $state();
	let selectedIndex = $state(0);
	let snaps: number[] = $state([]);

	const options: EmblaOptionsType = { loop: true, align: 'center', skipSnaps: false };
	const plugins = reduceMotion ? [] : [Autoplay({ delay: 6000, stopOnInteraction: false })];

	function onInit(event: CustomEvent<EmblaCarouselType>) {
		emblaApi = event.detail;
		snaps = emblaApi.scrollSnapList();

		const onSelect = () => {
			selectedIndex = emblaApi?.selectedScrollSnap() ?? 0;
		};

		emblaApi.on('select', onSelect).on('reInit', () => {
			snaps = emblaApi?.scrollSnapList() ?? [];
			onSelect();
		});

		onSelect();
	}

	const scrollPrev = () => emblaApi?.scrollPrev();
	const scrollNext = () => emblaApi?.scrollNext();
	const scrollTo = (i: number) => emblaApi?.scrollTo(i);
</script>

{#if reviews.length > 0}
	<section class="relative mx-auto w-full max-w-[1400px] overflow-hidden">
		<div class="mb-6 flex items-center justify-center gap-2">
			<svg class="h-5 w-5 fill-[#00b67a]" viewBox="0 0 24 24" aria-hidden="true">
				<path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7-6.3-4-6.3 4 1.7-7L2 9.5l7.1-.6L12 2z" />
			</svg>
			<span class="text-sm font-bold text-[#17200f]">Verified on Trustpilot</span>
		</div>

		<div
			class="embla w-full overflow-hidden"
			use:emblaCarouselSvelte={{ options, plugins }}
			onemblaInit={onInit}
			role="group"
			aria-roledescription="carousel"
			aria-label="Trustpilot reviews"
		>
			<div class="embla__container flex">
				{#each reviews as review, i (review._id)}
					<div
						class="embla__slide min-w-0 shrink-0 grow-0 basis-[88%] px-2 sm:basis-[75%] md:basis-[60%] md:px-3 lg:basis-[48%] lg:px-4 xl:basis-[42%]"
						role="group"
						aria-roledescription="slide"
						aria-label="{i + 1} of {reviews.length}"
					>
						<article class="relative h-full min-h-67.5 overflow-hidden rounded-[24px] border border-[#00b67a]/15 bg-[#f7f8f3] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:min-h-[300px] md:p-7">
							<div class="relative z-10 mb-5 flex items-center gap-3">
								{#if review.avatar}
									<img
										src={urlFor(review.avatar).width(100).height(100).url()}
										alt=""
										aria-hidden="true"
										class="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm md:h-14 md:w-14"
									/>
								{/if}
								<div>
									<p class="text-base font-bold text-[#17200f] md:text-lg">{review.name}</p>
									{#if review.location}
										<p class="text-sm text-[#17200f]/55 md:text-[15px]">{review.location}</p>
									{/if}
								</div>
							</div>

							<div class="relative z-10 mb-5 flex items-center gap-0.5" aria-label="{review.rating} out of 5 stars">
								{#each Array(review.rating) as _}
									<svg class="h-5 w-5 fill-[#00b67a] md:h-6 md:w-6" viewBox="0 0 20 20" aria-hidden="true">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								{/each}
							</div>

							<p class="relative z-10 max-w-[620px] text-[16px] leading-[1.6] text-[#17200f]/80 md:text-[19px] md:leading-[1.55]">
								{review.quote}
							</p>

							{#if review.reviewUrl}
								<a
									href={review.reviewUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="relative z-10 mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#00b67a] hover:underline"
								>
									View on Trustpilot
									<ExternalLink class="h-3 w-3" aria-hidden="true" />
								</a>
							{/if}

							<div class="absolute bottom-0 left-0 h-1 w-full bg-[#00b67a]" aria-hidden="true"></div>
						</article>
					</div>
				{/each}
			</div>
		</div>

		<div class="mt-8 flex items-center justify-center gap-5 md:mt-10">
			<button
				type="button"
				onclick={scrollPrev}
				aria-label="Previous review"
				class="flex h-11 w-11 items-center justify-center rounded-full border border-[#00b67a]/20 bg-white text-[#17200f] shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:bg-[#00b67a] hover:text-white"
			>
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
			</button>

			<div class="flex items-center gap-2" role="tablist" aria-label="Choose review">
				{#each snaps as _, i}
					<button
						type="button"
						class="h-2.5 rounded-full bg-[#00b67a]/30 transition-all duration-300"
						class:w-7={i === selectedIndex}
						class:w-2.5={i !== selectedIndex}
						class:bg-[#00b67a]={i === selectedIndex}
						role="tab"
						aria-selected={i === selectedIndex}
						aria-label="Go to review {i + 1}"
						onclick={() => scrollTo(i)}
					></button>
				{/each}
			</div>

			<button
				type="button"
				onclick={scrollNext}
				aria-label="Next review"
				class="flex h-11 w-11 items-center justify-center rounded-full border border-[#00b67a]/20 bg-white text-[#17200f] shadow-sm transition-all duration-200 hover:translate-x-0.5 hover:bg-[#00b67a] hover:text-white"
			>
				<ChevronRight class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		<div class="mt-6 text-center">
			<a
				href={trustpilotProfileUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="text-sm font-bold text-[#00b67a] hover:underline"
			>
				See all reviews on Trustpilot →
			</a>
		</div>
	</section>
{/if}