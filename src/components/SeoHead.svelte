<script lang="ts">
	import { urlFor } from '$lib/sanity/client';

	interface Props {
		title: string;
		description?: string;
		image?: { asset: { _ref: string } } | string;
		url?: string;
		siteName?: string;
		robots?: string;
	}

	let {
		title,
		description,
		image,
		url,
		siteName = 'Gidi Tour',
		robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
	}: Props = $props();

	function safeResolveImage(img: typeof image): string | undefined {
		if (!img) return undefined;
		if (typeof img === 'string') return img;
		try {
			return urlFor(img).width(1200).height(630).url();
		} catch {
			// Malformed Sanity image ref — skip the image rather than crash the page.
			return undefined;
		}
	}

	const resolvedImage = $derived(safeResolveImage(image));
</script>

<svelte:head>
	<title>{title}</title>
	{#if description}
		<meta name="description" content={description} />
	{/if}
	{#if url}
		<link rel="canonical" href={url} />
	{/if}
	<meta name="robots" content={robots} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={title} />
	{#if description}
		<meta property="og:description" content={description} />
	{/if}
	{#if url}
		<meta property="og:url" content={url} />
	{/if}
	{#if resolvedImage}
		<meta property="og:image" content={resolvedImage} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	{#if description}
		<meta name="twitter:description" content={description} />
	{/if}
	{#if resolvedImage}
		<meta name="twitter:image" content={resolvedImage} />
	{/if}
</svelte:head>