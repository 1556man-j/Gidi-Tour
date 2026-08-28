<script lang="ts">
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
	import Autoplay from 'embla-carousel-autoplay';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	const reduceMotion =
		typeof window !== 'undefined' &&
		window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

	let emblaApi: EmblaCarouselType | undefined = $state();
	let selectedIndex = $state(0);
	let snaps: number[] = $state([]);

	const options: EmblaOptionsType = {
		loop: true,
		align: 'center',
		skipSnaps: false
	};

	const plugins = reduceMotion
		? []
		: [Autoplay({ delay: 6000, stopOnInteraction: false })];

	const testimonials = [
		{
			name: 'Amara Johnson',
			location: 'London, UK',
			initials: 'AJ',
			color: '#5c9b19',
			avatar: '/images/people/avatar-1.JPG',
			rating: 5,
			quote:
				'Gidi gave me a completely different way to experience Lagos. It felt less like a tour and more like being shown around by someone who genuinely knows the city.'
		},
		{
			name: 'Daniel Williams',
			location: 'Manchester, UK',
			initials: 'DW',
			color: '#f98315',
			avatar: '/images/people/avatar-2.JPG',
			rating: 5,
			quote:
				'Everything was thoughtfully planned, but it never felt rushed. The food, people and stories made the whole experience unforgettable.'
		},
		{
			name: 'Sophie Martin',
			location: 'Paris, France',
			initials: 'SM',
			color: '#17200f',
			avatar: '/images/people/avatar-3.JPG',
			rating: 5,
			quote:
				'I wanted something beyond the usual tourist experience and Gidi delivered. I left with great memories and a much deeper connection to the place.'
		},
		{
			name: 'Michael Brown',
			location: 'New York, USA',
			initials: 'MB',
			color: '#8abf52',
			avatar: '/images/people/avatar-4.JPG',
			rating: 5,
			quote:
				'The experience felt personal from start to finish. Our guide was brilliant and every stop had a story behind it.'
		},
		{
			name: 'Grace Taylor',
			location: 'Toronto, Canada',
			initials: 'GT',
			color: '#d86f19',
			avatar: '/images/people/avatar-5.JPG',
			rating: 5,
			quote:
				'Gidi made travelling feel easy. Great people, great food and an experience I would happily do all over again.'
		}
	];

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

<section class="relative mx-auto w-full max-w-[1400px] overflow-hidden">
	<!-- Carousel -->
	<div
		class="embla w-full overflow-hidden"
		use:emblaCarouselSvelte={{ options, plugins }}
		onemblaInit={onInit}
		role="group"
		aria-roledescription="carousel"
		aria-label="Traveler testimonials"
	>
		<div class="embla__container flex">
			{#each testimonials as testimonial, i}
				<div
					class="embla__slide min-w-0 shrink-0 grow-0 basis-[88%] px-2 sm:basis-[75%] md:basis-[60%] md:px-3 lg:basis-[48%] lg:px-4 xl:basis-[42%]"
					role="group"
					aria-roledescription="slide"
					aria-label="{i + 1} of {testimonials.length}"
				>
					<article
						class="relative h-full min-h-[270px] overflow-hidden rounded-[24px] border border-[#5c9b19]/10 bg-[#f7f8f3] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:min-h-[300px] md:p-7"
					>
						<!-- Quote -->
						<div
							class="pointer-events-none absolute right-5 top-2 select-none font-serif text-[100px] leading-none text-[#5c9b19]/10 md:right-7 md:text-[130px]"
							aria-hidden="true"
						>
							“
						</div>

						<!-- Traveler -->
						<div class="relative z-10 mb-5 flex items-center gap-3">
							<img
								src={testimonial.avatar}
								alt=""
								aria-hidden="true"
								class="h-12 w-12 shrink-0 rounded-full border-2 border-white object-cover shadow-sm md:h-14 md:w-14"
							/>

							<div>
								<p class="text-base font-bold text-[#17200f] md:text-lg">
									{testimonial.name}
								</p>

								<p class="text-sm text-[#17200f]/55 md:text-[15px]">
									{testimonial.location}
								</p>
							</div>
						</div>

						<!-- Rating -->
						<div
							class="relative z-10 mb-5 flex items-center gap-0.5"
							aria-label="{testimonial.rating} out of 5 stars"
						>
							{#each Array(testimonial.rating) as _}
								<svg
									class="h-5 w-5 fill-[#f98315] md:h-6 md:w-6"
									viewBox="0 0 20 20"
									aria-hidden="true"
								>
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
							{/each}
						</div>

						<!-- Review -->
						<p
							class="relative z-10 max-w-[620px] text-[16px] leading-[1.6] text-[#17200f]/80 md:text-[19px] md:leading-[1.55]"
						>
							{testimonial.quote}
						</p>

						<!-- Gidi gradient -->
						<div
							class="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-[#f98315] to-[#5c9b19]"
							aria-hidden="true"
						></div>
					</article>
				</div>
			{/each}
		</div>
	</div>

	<!-- Controls -->
	<div class="mt-8 flex items-center justify-center gap-5 md:mt-10">
		<button
			type="button"
			onclick={scrollPrev}
			aria-label="Previous testimonial"
			class="flex h-11 w-11 items-center justify-center rounded-full border border-[#5c9b19]/20 bg-white text-[#17200f] shadow-sm transition-all duration-200 hover:-translate-x-0.5 hover:bg-[#5c9b19] hover:text-white focus-visible:outline-2 focus-visible:outline-[#f98315] focus-visible:outline-offset-2"
		>
			<ChevronLeft class="h-5 w-5" aria-hidden="true" />
		</button>

		<div
			class="flex items-center gap-2"
			role="tablist"
			aria-label="Choose testimonial"
		>
			{#each snaps as _, i}
				<button
					type="button"
					class="h-2.5 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#f98315] focus-visible:outline-offset-2"
					class:w-7={i === selectedIndex}
					class:w-2.5={i !== selectedIndex}
					// class:bg-[#5c9b19]={i === selectedIndex}
					// class:bg-[#5c9b19]={i !== selectedIndex}
					role="tab"
					aria-selected={i === selectedIndex}
					aria-label="Go to testimonial {i + 1}"
					onclick={() => scrollTo(i)}
				></button>
			{/each}
		</div>

		<button
			type="button"
			onclick={scrollNext}
			aria-label="Next testimonial"
			class="flex h-11 w-11 items-center justify-center rounded-full border border-[#5c9b19]/20 bg-white text-[#17200f] shadow-sm transition-all duration-200 hover:translate-x-0.5 hover:bg-[#5c9b19] hover:text-white focus-visible:outline-2 focus-visible:outline-[#f98315] focus-visible:outline-offset-2"
		>
			<ChevronRight class="h-5 w-5" aria-hidden="true" />
		</button>
	</div>
</section>