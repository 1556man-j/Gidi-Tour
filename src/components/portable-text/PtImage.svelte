<script lang="ts">
	import { urlFor } from '$lib/sanity/client';

	let { value } = $props();

	const imageUrl = value?.asset
		? urlFor(value).width(1200).auto('format').url()
		: null;

	const alt = value?.alt || 'Gidi Tour travel experience';
</script>

{#if imageUrl}
	<figure class="my-8">
		<img
			src={imageUrl}
			alt={alt}
			class="h-auto w-full rounded-2xl object-cover"
			loading="lazy"
		/>

		{#if value?.caption}
			<figcaption class="mt-2 text-center text-sm text-[#17200f]/50">
				{value.caption}
			</figcaption>
		{/if}
	</figure>
{/if}