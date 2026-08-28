<script>
	import { onMount } from 'svelte';

	let exploreOpen = $state(false);
	let destinationsOpen = $state(false);
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

	const experiences = [
		{ name: 'Food & Culture', href: '/experiences/food-culture' },
		{ name: 'History & Heritage', href: '/experiences/history-heritage' },
		{ name: 'Adventure', href: '/experiences/adventure' },
		{ name: 'Nature', href: '/experiences/nature' },
		{ name: 'Nightlife', href: '/experiences/nightlife' },
		{ name: 'Art & Creativity', href: '/experiences/art-creativity' }
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
		<a
			href="/"
			aria-label="Gidi Tour home"
			class="group mr-auto flex shrink-0 flex-col leading-none"
		>
			<span
				class="text-[22px] font-bold tracking-[-0.04em] text-white transition-transform duration-300 group-hover:-translate-y-0.5 lg:text-[25px]"
			>
				GIDI<span class="text-[#FFC107]">×</span>
			</span>

			<span class="text-[11px] font-bold tracking-[0.25em] text-[#FFC107] lg:text-xs"> TOUR </span>
		</a>

		<!-- NAV LINKS -->
		<div class="flex items-center gap-1 lg:gap-2">
			<!-- HOME -->
			<a
				href="/"
				class="group relative rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:px-4"
			>
				Home

				<span
					class="absolute bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-[#FFC107] transition-all duration-300 group-hover:w-4"
				></span>
			</a>

			<!-- EXPLORE -->
			<div class="relative">
				<button
					type="button"
					aria-expanded={exploreOpen}
					onclick={() => {
						exploreOpen = !exploreOpen;
						destinationsOpen = false;
					}}
					class="flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:px-4"
				>
					Explore

					<svg
						class:rotate-180={exploreOpen}
						class="h-3.5 w-3.5 transition-transform duration-300"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path
							d="M5 7.5L10 12.5L15 7.5"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				{#if exploreOpen}
					<div
						class="absolute left-1/2 top-[58px] w-[340px] -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-[#101010]/95 p-3 shadow-2xl backdrop-blur-2xl"
					>
						<div class="mb-2 px-3 py-2">
							<p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFC107]">
								Explore Gidi Tour
							</p>
						</div>

						<a
							href="/tours"
							class="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/5"
						>
							<div>
								<p class="text-sm font-semibold text-white">All Tours</p>
								<p class="mt-0.5 text-xs text-white/40">Discover every experience</p>
							</div>

							<span
								class="text-white/30 transition group-hover:translate-x-1 group-hover:text-[#FFC107]"
							>
								→
							</span>
						</a>

						<a
							href="/experiences"
							class="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/5"
						>
							<div>
								<p class="text-sm font-semibold text-white">Experiences</p>
								<p class="mt-0.5 text-xs text-white/40">Things worth experiencing</p>
							</div>

							<span
								class="text-white/30 transition group-hover:translate-x-1 group-hover:text-[#FFC107]"
							>
								→
							</span>
						</a>

						<a
							href="/private-tours"
							class="group flex items-center justify-between rounded-xl px-3 py-3 transition hover:bg-white/5"
						>
							<div>
								<p class="text-sm font-semibold text-white">Private Tours</p>
								<p class="mt-0.5 text-xs text-white/40">Your journey, your way</p>
							</div>

							<span
								class="text-white/30 transition group-hover:translate-x-1 group-hover:text-[#FFC107]"
							>
								→
							</span>
						</a>
					</div>
				{/if}
			</div>

			<!-- DESTINATIONS -->
			<div class="relative">
				<button
					type="button"
					aria-expanded={destinationsOpen}
					onclick={() => {
						destinationsOpen = !destinationsOpen;
						exploreOpen = false;
					}}
					class="flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:px-4"
				>
					Destinations

					<svg
						class:rotate-180={destinationsOpen}
						class="h-3.5 w-3.5 transition-transform duration-300"
						viewBox="0 0 20 20"
						fill="none"
					>
						<path
							d="M5 7.5L10 12.5L15 7.5"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				{#if destinationsOpen}
					<div
						class="absolute left-1/2 top-[58px] w-[390px] -translate-x-1/2 rounded-2xl border border-white/10 bg-[#101010]/95 p-4 shadow-2xl backdrop-blur-2xl"
					>
						<div class="mb-3">
							<p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FFC107]">
								Where do you want to go?
							</p>
						</div>

						<div class="grid grid-cols-2 gap-1">
							{#each destinations as destination}
								<a
									href={destination.href}
									class="rounded-lg px-3 py-2.5 text-xs font-medium text-white/70 transition hover:bg-white/5 hover:text-[#FFC107]"
								>
									{destination.name}
								</a>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- EXPERIENCES -->
			<a
				href="/experiences"
				class="group hidden rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:block lg:px-4"
			>
				Experiences
			</a>

			<!-- STORIES -->
			<a
				href="/stories"
				class="hidden rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:block lg:px-4"
			>
				Stories
			</a>

			<!-- ABOUT -->
			<a
				href="/about"
				class="hidden rounded-full px-3 py-2 text-[13px] font-medium text-white/80 transition-all duration-300 hover:bg-white/5 hover:text-white lg:block lg:px-4"
			>
				About
			</a>
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
				class="group flex h-10 items-center gap-2 rounded-full bg-[#FFC107] px-4 text-xs font-bold text-black transition-all duration-300 hover:scale-[1.03] hover:bg-[#FFD54F] lg:px-5"
			>
				<span>Book a Tour</span>

				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[#FFC107] transition-transform duration-300 group-hover:translate-x-0.5"
				>
					→
				</span>
			</a>

			<!-- MENU BUTTON -->
			<button
				type="button"
				aria-label="Open menu"
				class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
			>
				<svg class="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
					<path
						d="M4 8H20M4 16H20"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>
	</nav>
</header>
