<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
    import Testimonial from './Testimonial.svelte'

	let {
		badgeText = 'Travelers Love Gidi',
		headline = 'Real travelers. Real stories.'
	}: {
		badgeText?: string;
		headline?: string;
	} = $props();
</script>

<section
	use:reveal
	class="border-y border-[#17200f]/10 bg-[#f7f8f3] px-0 py-10 md:py-16"
>
	<div class="mx-auto mb-10 max-w-2xl px-5 text-center md:mb-12">
		<!-- Small label -->
		<p
			class="mb-3 text-lg font-bold text-[#5c9b19] capitalize"
		>
			{badgeText}
		</p>

		<!-- Heading -->
		<h2
			class="text-3xl font-extrabold leading-[1.1] tracking-[-0.03em] text-[#17200f] md:text-5xl"
		>
			{headline}
		</h2>

		<p
			class="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#17200f]/60 md:text-base"
		>
			From first-time visitors to returning travelers, these are the
			experiences people remember long after the trip ends.
		</p>
	</div>

	<Testimonial  />
</section>