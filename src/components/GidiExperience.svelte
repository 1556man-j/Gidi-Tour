<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	type Experience = { n: string; name: string; image: string };

	let { experiences }: { experiences?: Experience[] } = $props();

	const fallbackExperiences: Experience[] = [
		{
			n: '01',
			name: 'Food & Culture',
			image:
				'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=700&q=80'
		},
		{
			n: '02',
			name: 'Adventure',
			image:
				'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=700&q=80'
		},
		{
			n: '03',
			name: 'History & Heritage',
			image:
				'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=700&q=80'
		},
		{
			n: '04',
			name: 'Nature',
			image:
				'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=80'
		},
		{
			n: '05',
			name: 'Local Life',
			image:
				'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?auto=format&fit=crop&w=700&q=80'
		},
		{
			n: '06',
			name: 'Nightlife',
			image:
				'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80'
		}
	];

	const experienceList = $derived(
		experiences && experiences.length ? experiences : fallbackExperiences
	);

	let experienceTrack: HTMLDivElement | undefined;

	function scrollExperiences(dir: number) {
		const track = experienceTrack;
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

	let experienceActiveDot = $state(0);
	function updateExperienceActiveDot() {
		const track = experienceTrack;
		if (!track) return;
		const maxScroll = track.scrollWidth - track.clientWidth;
		if (maxScroll <= 0) {
			experienceActiveDot = 0;
			return;
		}
		const ratio = track.scrollLeft / maxScroll;
		experienceActiveDot = Math.round(ratio * (experienceList.length - 1));
	}
	function goToExperienceDot(i: number) {
		const track = experienceTrack;
		if (!track) return;
		const maxScroll = track.scrollWidth - track.clientWidth;
		track.scrollTo({
			left: maxScroll * (i / (experienceList.length - 1 || 1)),
			behavior: 'smooth'
		});
	}
</script>

<!-- EXPERIENCE -->
<section class="overflow-hidden px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
	<div class="mx-auto max-w-[1440px]">
		<div class="reveal grid gap-8 lg:grid-cols-12 lg:items-end">
			<div class="lg:col-span-7">
				<p class="text-[17px] font-bold capitalize text-[#F98315]">The Gidi experience</p>
				<h2
					class="font-display mt-3 text-black text-5xl leading-[.9] tracking-[-.04em] sm:text-6xl"
				>
					It's more than a trip.<br /><span class="text-[#5C9B19]">It's a connection.</span>
				</h2>
			</div>
			<p class="max-w-md text-lg leading-6 text-black/75 lg:col-span-4 lg:col-start-9">
				We go beyond the usual. Every experience is designed to bring you closer to the culture,
				people, food and stories that make each destination unique.
			</p>
		</div>

		<div class="mt-12 flex items-center gap-4">
			<button
				type="button"
				class="hidden md:flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[#5C9B19] shadow-md text-white hover:scale-110 transition"
				onclick={() => scrollExperiences(-1)}
				aria-label="Previous experience"
			>
				<ChevronLeft class="w-5 h-5" aria-hidden="true" />
			</button>

			<div
				class="experience__track"
				bind:this={experienceTrack}
				onscroll={updateExperienceActiveDot}
			>
				{#each experienceList as experience (experience.name)}
					<a
						href="/experiences"
						class="experience__card group relative min-w-[280px] overflow-hidden rounded-[22px] border border-white/10 bg-white/5 sm:min-w-[340px] lg:min-w-[380px] lg:flex-1"
					>
						<img
							src={experience.image}
							alt={experience.name}
							class="h-[190px] w-full object-cover opacity-80 transition duration-700 group-hover:scale-105 group-hover:opacity-100 sm:h-[210px] lg:h-[230px]"
							loading="lazy"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
						></div>
						<div class="absolute inset-x-0 bottom-0 p-5">
							<p class="mb-3 text-[10px] font-bold text-[#F98315]">{experience.n}</p>
							<h3 class="font-display text-2xl">{experience.name}</h3>
						</div>
					</a>
				{/each}
			</div>

			<button
				type="button"
				class="hidden md:flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-[#5C9B19] shadow-md text-white hover:scale-110 transition"
				onclick={() => scrollExperiences(1)}
				aria-label="Next experience"
			>
				<ChevronRight class="w-5 h-5" aria-hidden="true" />
			</button>
		</div>

		<div
			class="flex items-center justify-center gap-2 mt-8"
			role="tablist"
			aria-label="Choose experience"
		>
			{#each experienceList as experience, i (experience.name)}
				<button
					type="button"
					class="experience__dot"
					class:experience__dot--active={i === experienceActiveDot}
					role="tab"
					aria-selected={i === experienceActiveDot}
					aria-label="Go to experience {i + 1}"
					onclick={() => goToExperienceDot(i)}
				></button>
			{/each}
		</div>
	</div>
</section>

<style>
	.experience__track {
		display: flex;
		gap: 12px;
		min-width: 0;
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		scroll-behavior: smooth;
		scrollbar-width: none;
		-webkit-overflow-scrolling: touch;
		padding-bottom: 20px;
	}
	.experience__track::-webkit-scrollbar {
		display: none;
	}

	.experience__card {
		flex-shrink: 0;
		scroll-snap-align: start;
	}

	.experience__dot {
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
	.experience__dot--active {
		width: 19px;
		background: #f98315;
	}
	.experience__dot:focus-visible {
		outline: 2px solid #f98315;
		outline-offset: 2px;
	}
</style>
