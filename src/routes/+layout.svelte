<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import favicon from '$lib/assets/favicon.svg';
	import MobileNav from '../components/MobileNav.svelte';
	import Navbar from '../components/Navbar.svelte';
	import Footer from '../components/Footer.svelte';
	import TourSidebar from '../components/TourSidebar.svelte';
	import CookieConsent from '../components/CookieConsent.svelte';

	let { data, children } = $props();

	async function notifyVisitor(): Promise<void> {
		if (typeof window === 'undefined') return;

		const notifiedKey = 'gidi_visitor_notified';

		// Only notify once per browser session
		if (sessionStorage.getItem(notifiedKey)) {
			return;
		}

		try {
			const response = await fetch('/api/visitor', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					page: window.location.href,
					title: document.title,
					referrer: document.referrer || 'Direct',
					userAgent: navigator.userAgent,
					screen: `${window.innerWidth} × ${window.innerHeight}`,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
				})
			});

			if (response.ok) {
				sessionStorage.setItem(notifiedKey, 'true');
			}
		} catch (error) {
			console.error('Visitor notification failed:', error);
		}
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
					}
				});
			},
			{ threshold: 0.12 }
		);

		document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

		notifyVisitor();

		return () => observer.disconnect();
	});
</script>

<Navbar />
<MobileNav />
<svelte:head>
	<!-- <script async src="https://www.googletagmanager.com/gtag/js?id=G-YW1HK7XNWF"></script>
	<script>
		window.dataLayer = window.dataLayer || [];
		function gtag() {
			dataLayer.push(arguments);
		}
		gtag('js', new Date());

		gtag('config', 'G-YW1HK7XNWF');
	</script> -->

	<link rel="icon" href={favicon} />
	{#if data.siteSettings?.defaultSeo?.metaTitle}
		<title>{data.siteSettings.defaultSeo.metaTitle}</title>
	{/if}
	{#if data.siteSettings?.defaultSeo?.metaDescription}
		<meta name="description" content={data.siteSettings.defaultSeo.metaDescription} />
	{/if}
	
	<script>
		var Tawk_API = Tawk_API || {};
		var Tawk_LoadStart = new Date();

		(function () {
			var s1 = document.createElement('script');
			var s0 = document.getElementsByTagName('script')[0];

			s1.async = true;
			s1.src = 'https://embed.tawk.to/6ab4f928b4e31a3443e06993/1k39eqmo4';
			s1.charset = 'UTF-8';
			s1.setAttribute('crossorigin', '*');

			s0.parentNode.insertBefore(s1, s0);
		})();
	</script>
</svelte:head>

{@render children()}
<TourSidebar />
<Footer />
<CookieConsent />