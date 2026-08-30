<script>
	import { onMount } from 'svelte';

	let open = $state(false);
	let scrolled = $state(false);

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Destinations', href: '/destinations' },
		{ label: 'Tours', href: '/tours' },
		{ label: 'About Us', href: '/about' },
		{ label: 'Travel Journal', href: '/stories' },
		{ label: 'Contact', href: '/contact' }
	];

	const destinations = [
		{ name: 'Nigeria', href: '/destinations/nigeria' },
		{ name: 'Ghana', href: '/destinations/ghana' },
		{ name: 'Kenya', href: '/destinations/kenya' },
		{ name: 'Tanzania', href: '/destinations/tanzania' },
		{ name: 'Rwanda', href: '/destinations/rwanda' },
		{ name: 'Egypt', href: '/destinations/egypt' },
		{ name: 'Morocco', href: '/destinations/morocco' },
		{ name: 'South Africa', href: '/destinations/south-africa' },
		{ name: 'United Kingdom', href: '/destinations/uk' }
	];

	onMount(() => {
		const onScroll = () => {
			scrolled = window.scrollY > 10;
		};

		onScroll();

		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			window.removeEventListener('scroll', onScroll);
		};
	});

	function closeMenu() {
		open = false;
	}

	function toggleMenu() {
		open = !open;
	}
</script>

<!-- MOBILE NAV -->
<header
	class:pt-3={scrolled}
	class="fixed inset-x-0 top-0 z-[60] px-3 transition-all duration-500 ease-out md:hidden"
>
	<nav
		class={`flex h-[64px] items-center justify-between border px-4 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out ${
			scrolled
				? 'rounded-2xl border-white/10 bg-black/55'
				: 'rounded-b-2xl border-transparent bg-black/55'
		}`}
	>
		<!-- LOGO -->
		<a href="/" aria-label="Gidi Tour home" onclick={closeMenu} class="flex flex-col leading-none">
			<span class="text-[22px] font-bold tracking-[-0.05em] text-white">
				GIDI<span class="text-[#f98315]">×</span>
			</span>

			<span class="text-[10px] font-bold tracking-[0.25em] text-[#f98315]"> TOUR </span>
		</a>

		<!-- RIGHT -->
		<div class="flex items-center gap-2">
			<!-- BOOK -->
			<a
				href="/book"
				onclick={closeMenu}
				class="flex h-10 items-center gap-1.5 rounded-full bg-[#f98315] px-3.5 text-[11px] font-bold text-black transition active:scale-95"
			>
				Book a Tour

				<span class="flex h-5 w-5 items-center justify-center rounded-full bg-black text-[#f98315]">
					→
				</span>
			</a>

			<!-- MENU -->
			<button
				type="button"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onclick={toggleMenu}
				class="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-95"
			>
				{#if !open}
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
						<path d="M4 8H20M4 16H20" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
					</svg>
				{:else}
					<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none">
						<path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
					</svg>
				{/if}
			</button>
		</div>
	</nav>
</header>

<!-- FULL SCREEN MENU -->
{#if open}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-black text-white md:hidden">
		<!-- TOP -->
		<div class="flex items-center justify-between px-5 pb-5 pt-24">
			<div>
				<p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#f98315]">
					Explore Gidi Tour
				</p>

				<h2 class="mt-2 text-2xl font-bold tracking-tight">Where will you go?</h2>
			</div>
		</div>

		<!-- MAIN LINKS -->
		<div class="px-5">
			{#each navLinks as link, i (link.href)}
				<a
					href={link.href}
					onclick={closeMenu}
					class="group flex items-center justify-between border-b border-white/10 py-5"
				>
					<div class="flex items-center gap-4">
						<span class="text-xs text-[#f98315]">{String(i + 1).padStart(2, '0')}</span>
						<span class="text-2xl font-semibold">{link.label}</span>
					</div>

					<span class="text-white/30 transition group-hover:translate-x-1 group-hover:text-[#f98315]">
						→
					</span>
				</a>
			{/each}
		</div>

		<!-- DESTINATIONS -->
		<div class="px-5 pb-8 pt-10">
			<div class="mb-5 flex items-end justify-between">
				<div>
					<p class="text-[10px] uppercase tracking-[0.2em] text-white/40">Explore by location</p>

					<h3 class="mt-1 text-lg font-semibold">Destinations</h3>
				</div>

				<a href="/destinations" onclick={closeMenu} class="text-xs text-[#f98315]"> View all → </a>
			</div>

			<div class="grid grid-cols-2 gap-2">
				{#each destinations as destination (destination.href)}
					<a
						href={destination.href}
						onclick={closeMenu}
						class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition active:bg-[#f98315] active:text-black"
					>
						{destination.name}
					</a>
				{/each}
			</div>
		</div>

		<!-- CTA -->
		<div class="px-5 pb-10">
			<a
				href="/book"
				onclick={closeMenu}
				class="group flex w-full items-center justify-between rounded-2xl bg-[#f98315] px-5 py-4 text-black"
			>
				<div>
					<p class="text-[10px] font-semibold uppercase tracking-[0.15em]">Ready to travel?</p>

					<p class="mt-1 text-lg font-bold">Book your experience</p>
				</div>

				<span
					class="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[#f98315] transition-transform duration-300 group-hover:translate-x-1"
				>
					→
				</span>
			</a>
		</div>
	</div>
{/if}