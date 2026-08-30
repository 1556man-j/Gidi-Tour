<script>
	import { onMount } from 'svelte';

	let scrolled = $state(false);

	onMount(() => {
		const getScrollY = () =>
			window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;

		const onScroll = () => {
			scrolled = getScrollY() > 10;
		};

		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Destinations', href: '/destinations' },
		{ label: 'Tours', href: '/tours' },
		{ label: 'About Us', href: '/about' },
		{ label: 'Travel Journal', href: '/stories' },
		{ label: 'Contact', href: '/contact' }
	];
</script>

<!--
	Desktop + Tablet Navigation
	Hidden below md
-->

<header
	class:pt-4={scrolled}
	class="fixed inset-x-0 top-0 z-50 hidden px-4 transition-all duration-500 ease-out md:block lg:px-8"
>
	<nav
		class:rounded-2xl={scrolled}
		class:rounded-b-2xl={!scrolled}
		class="mx-auto flex h-[68px] max-w-[1440px] items-center border border-white/10 bg-black/55 px-4 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out lg:px-6"
	>
		<!-- LOGO -->
		<a href="/" aria-label="Gidi Tour home" class="group mr-auto flex shrink-0 flex-col leading-none">
			<span
				class="text-[22px] font-bold tracking-[-0.04em] text-white transition-transform duration-300 group-hover:-translate-y-0.5 lg:text-[25px]"
			>
				GIDI<span class="text-[#f98315]">×</span>
			</span>

			<span class="text-[11px] font-bold tracking-[0.25em] text-[#f98315] lg:text-xs"> TOUR </span>
		</a>

		<!-- NAV LINKS -->
		<div class="flex items-center gap-1 lg:gap-2">
			{#each navLinks as link (link.href)}
				<a
					href={link.href}
					class="group relative rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:px-4"
				>
					{link.label}

					<span
						class="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#f98315] transition-all duration-300 group-hover:w-4"
					></span>
				</a>
			{/each}
		</div>

		<!-- RIGHT SIDE -->
		<div class="ml-3 flex items-center gap-2 lg:ml-5">
			<!-- SEARCH -->
			<button
				type="button"
				aria-label="Search"
				class="hidden h-10 w-10 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-white lg:flex"
			>
				<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
					<circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.7" />
					<path d="M16 16L21 21" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
				</svg>
			</button>

			<!-- BOOK BUTTON -->
			<a
				href="/book"
				class="group flex h-10 items-center gap-2 rounded-full bg-[#f98315] px-4 text-xs font-bold text-black transition-all duration-300 hover:scale-[1.03] hover:bg-[#FFD54F] lg:px-5"
			>
				<span>Book a Tour</span>

				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[#fff] transition-transform duration-300 group-hover:translate-x-0.5"
				>
					→
				</span>
			</a>

			<!-- MENU BUTTON -->
			<!-- <button
				type="button"
				aria-label="Open menu"
				class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
			>
				<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
					<path d="M4 8H20M4 16H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
				</svg>
			</button> -->
		</div>
	</nav>
</header>