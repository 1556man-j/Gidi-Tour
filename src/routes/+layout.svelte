<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import MobileNav from '../components/MobileNav.svelte';
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import TourSidebar from '../components/TourSidebar.svelte';
	
let { data, children } = $props();

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) entry.target.classList.add('visible');
				});
			},
			{ threshold: 0.12 }
		);

		document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	});
</script>

<Navbar />
<MobileNav />
<svelte:head>
	<link rel="icon" href={favicon} />
	{#if data.siteSettings?.defaultSeo?.metaTitle}
		<title>{data.siteSettings.defaultSeo.metaTitle}</title>
	{/if}
	{#if data.siteSettings?.defaultSeo?.metaDescription}
		<meta name="description" content={data.siteSettings.defaultSeo.metaDescription} />
	{/if}
</svelte:head>

{@render children()}
<TourSidebar/>
<Footer/>