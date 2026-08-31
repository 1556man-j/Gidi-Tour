<script lang="ts">
	import { X, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { fade, scale } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	let { cityName, blurb, images, onClose }: {
		cityName: string;
		blurb: string;
		images: string[];
		onClose: () => void;
	} = $props();

	let lightboxIndex = $state<number | null>(null);

	function openLightbox(i: number) {
		lightboxIndex = i;
	}
	function closeLightbox() {
		lightboxIndex = null;
	}
	function nextImage() {
		if (lightboxIndex === null) return;
		lightboxIndex = (lightboxIndex + 1) % images.length;
	}
	function prevImage() {
		if (lightboxIndex === null) return;
		lightboxIndex = (lightboxIndex - 1 + images.length) % images.length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (lightboxIndex !== null) {
			if (e.key === 'Escape') closeLightbox();
			if (e.key === 'ArrowRight') nextImage();
			if (e.key === 'ArrowLeft') prevImage();
		} else if (e.key === 'Escape') {
			onClose();
		}
	}

	// alternate row spans for a masonry-ish feel without a real masonry lib
	function spanClass(i: number) {
		const pattern = [
			'row-span-2', 'row-span-1', 'row-span-1',
			'row-span-1', 'row-span-2', 'row-span-1'
		];
		return pattern[i % pattern.length];
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop -->
<div
	class="fixed inset-0 z-100 flex items-end justify-center bg-[#17200f]/70 backdrop-blur-sm sm:items-center sm:p-6"
	transition:fade={{ duration: 250 }}
	onclick={onClose}
	role="presentation"
>
	<!-- Panel -->
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-4xl bg-[#f7f3ea] sm:max-w-4xl sm:rounded-4xl"
		transition:scale={{ duration: 320, start: 0.94, easing: cubicOut }}
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
		aria-label={`${cityName} photo gallery`}
	>
		<!-- Header -->
		<div class="flex items-start justify-between gap-4 border-b border-black/10 p-6 sm:p-8">
			<div>
				<p class="text-[17px] font-bold uppercase text-[#5C9B19]">Gallery</p>
				<h2 class="font-bold mt-1 text-2xl tracking-[-.02em] text-[#17200f] sm:text-3xl md:text-4xl">{cityName}</h2>
				<p class="mt-1 text-sm text-[#17200f]/85">{blurb}</p>
			</div>
			<button
				type="button"
				onclick={onClose}
				aria-label="Close gallery"
				class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/5 text-[#17200f] transition hover:bg-black/10"
			>
				<X class="h-4 w-4" aria-hidden="true" />
			</button>
		</div>

		<!-- Masonry grid -->
		<div class="overflow-y-auto p-6 sm:p-8 scrollbar-hide">
			<div class="grid auto-rows-27.5 grid-cols-2 gap-3 sm:auto-rows-35 sm:grid-cols-3">
				{#each images as src, i (src)}
					<button
						type="button"
						onclick={() => openLightbox(i)}
						class="gallery-thumb group relative overflow-hidden rounded-2xl {spanClass(i)}"
						style="animation-delay: {i * 60}ms;"
					>
						<img
							src={src}
							alt={`${cityName} photo ${i + 1}`}
							class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
							loading="lazy"
						/>
						<div class="absolute inset-0 bg-black/0 transition group-hover:bg-black/10"></div>
					</button>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- Lightbox -->
{#if lightboxIndex !== null}
	<div
		class="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4"
		transition:fade={{ duration: 200 }}
		onclick={closeLightbox}
		role="presentation"
	>
		<button
			type="button"
			onclick={closeLightbox}
			aria-label="Close image"
			class="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
		>
			<X class="h-5 w-5" aria-hidden="true" />
		</button>

		{#if images.length > 1}
			<button
				type="button"
				onclick={(e) => { e.stopPropagation(); prevImage(); }}
				aria-label="Previous image"
				class="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:left-6"
			>
				<ChevronLeft class="h-5 w-5" aria-hidden="true" />
			</button>
			<button
				type="button"
				onclick={(e) => { e.stopPropagation(); nextImage(); }}
				aria-label="Next image"
				class="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 sm:right-6"
			>
				<ChevronRight class="h-5 w-5" aria-hidden="true" />
			</button>
		{/if}

		{#key lightboxIndex}
			<img
				src={images[lightboxIndex]}
				alt={`${cityName} photo ${lightboxIndex + 1}`}
				class="max-h-[85vh] max-w-[92vw] rounded-2xl object-contain"
				onclick={(e) => e.stopPropagation()}
				in:scale={{ duration: 250, start: 0.96, easing: cubicOut }}
			/>
		{/key}

		<div class="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
			{lightboxIndex + 1} / {images.length}
		</div>
	</div>
{/if}

<style>
	.gallery-thumb {
		opacity: 0;
		transform: translateY(10px);
		animation: thumb-in 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	@keyframes thumb-in {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.gallery-thumb {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}
</style>