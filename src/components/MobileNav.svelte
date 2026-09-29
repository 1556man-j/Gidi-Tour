<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';
	import { tourStore } from '$lib/stores/tourStore.svelte';

	let open = $state(false);
	let accountOpen = $state(false);
	let scrolled = $state(false);

	const navLinks = [
		{ label: 'Home', href: '/' },
		{ label: 'Destinations', href: '/destinations' },
		{ label: 'Tours', href: '/tours' },
		{ label: 'About Us', href: '/about' },
		{ label: 'Travel Journal', href: '/stories' },
		{ label: 'Store', href: '/store' },
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
		accountOpen = false;
	}

	function toggleMenu() {
		open = !open;
		accountOpen = false;
	}

	function toggleAccount() {
		accountOpen = !accountOpen;
		open = false;
	}

	async function handleSignOut() {
		accountOpen = false;
		await signOut({ callbackUrl: '/' });
	}
</script>

<!-- MOBILE NAV -->
<header
	class:pt-3={scrolled}
	class="fixed inset-x-0 top-0 z-[60] px-3 transition-all duration-500 ease-out md:hidden"
>
	<nav
		class={[
			'flex h-16 items-center justify-between px-3.5 transition-all duration-500 ease-out',
			scrolled
				? 'rounded-2xl border border-white/10 bg-black/65 shadow-2xl backdrop-blur-xl'
				: 'rounded-b-2xl border border-transparent bg-black/55 backdrop-blur-xl'
		].join(' ')}
	>
		<!-- LOGO -->
		<a
			href="/"
			aria-label="Gidi Tour home"
			onclick={closeMenu}
			class="flex w-[92px] shrink-0 items-center"
		>
			<img src="/images/assets/LOGO-3.png" alt="Gidi Tour" class="block w-full object-contain" />
		</a>

		<!-- RIGHT ACTIONS -->
		<div class="flex items-center gap-1">
			<!-- TOUR LIST -->
			<button
				type="button"
				onclick={() => tourStore.toggleSidebar()}
				aria-label="Your tour list"
				class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition active:scale-90 hover:bg-white/10 hover:text-white"
			>
				<svg
					class="h-[21px] w-[21px]"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
					<path d="M16 11V7a4 4 0 0 0-8 0v4" />
				</svg>

				{#if tourStore.count > 0}
					<span
						class="absolute right-1 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#f98315] px-1 text-[9px] font-bold leading-none text-black"
					>
						{tourStore.count}
					</span>
				{/if}
			</button>

			<!-- ACCOUNT -->
			{#if page.data.session?.user}
				{@const account = page.data.customer}
				{@const displayName =
					account?.name ?? page.data.session.user.name ?? page.data.session.user.email ?? '?'}
				<div class="relative">
					<button
						type="button"
						onclick={toggleAccount}
						aria-label="Account menu"
						aria-expanded={accountOpen}
						>{#if account?.avatarUrl}
							<img
								src={account.avatarUrl}
								alt=""
								class="h-11 w-11 object-cover rounded-full border border-[#f98315]/70"
							/>
						{:else}
							<div
								class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f98315]/70 bg-white/5 text-sm font-bold text-white transition active:scale-90 hover:bg-white/10"
							>
								{displayName.charAt(0).toUpperCase()}
							</div>
						{/if}
					</button>

					{#if accountOpen}
						<div
							class="absolute right-0 top-[calc(100%+10px)] w-52 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-2xl"
						>
							<div class="border-b border-black/5 px-3 py-2.5">
								<p class="truncate text-xs font-semibold text-[#17200f]">
									{displayName}
								</p>

								{#if page.data.session.user.email}
									<p class="mt-0.5 truncate text-[10px] text-[#17200f]/50">
										{page.data.session.user.email}
									</p>
								{/if}
							</div>

							<a
								href="/account/bookings"
								onclick={() => (accountOpen = false)}
								class="mt-1 flex items-center rounded-xl px-3 py-2.5 text-sm text-[#17200f] transition hover:bg-black/5"
							>
								My Bookings
							</a>

							<a
								href="/account/profile"
								onclick={() => (accountOpen = false)}
								class="flex items-center rounded-xl px-3 py-2.5 text-sm text-[#17200f] transition hover:bg-black/5"
							>
								Profile
							</a>

							<button
								type="button"
								onclick={handleSignOut}
								class="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-red-500 transition hover:bg-red-50"
							>
								Log out
							</button>
						</div>
					{/if}
				</div>
			{:else}
				<a
					href="/login"
					aria-label="Log in"
					class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f98315]/70 bg-white/5 text-white transition active:scale-90 hover:bg-[#f98315] hover:text-black"
				>
					<svg
						class="h-[21px] w-[21px]"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="8" r="3.5" />
						<path d="M5 20c.8-3.3 3.3-5 7-5s6.2 1.7 7 5" />
					</svg>
				</a>
			{/if}

			<!-- MENU BUTTON -->
			<button
				type="button"
				aria-label={open ? 'Close menu' : 'Open menu'}
				aria-expanded={open}
				onclick={toggleMenu}
				class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition active:scale-90 hover:bg-white/10"
			>
				{#if !open}
					<svg class="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M4 8H20M4 16H20"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
						/>
					</svg>
				{:else}
					<svg class="h-[21px] w-[21px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
						<path
							d="M6 6L18 18M18 6L6 18"
							stroke="currentColor"
							stroke-width="1.7"
							stroke-linecap="round"
						/>
					</svg>
				{/if}
			</button>
		</div>
	</nav>
</header>

<!-- FULL SCREEN MOBILE MENU -->
{#if open}
	<div class="fixed inset-0 z-50 overflow-y-auto bg-[#080b06] text-white md:hidden">
		<!-- MENU HEADER -->
		<div class="flex items-center justify-between px-5 pb-6 pt-24">
			<div>
				<p class="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#f98315]">
					Explore Gidi Tour
				</p>

				<h2 class="mt-2 text-2xl font-bold tracking-tight">Where will you go?</h2>
			</div>

			<button
				type="button"
				onclick={closeMenu}
				aria-label="Close menu"
				class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/70"
			>
				<svg
					class="h-5 w-5"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
				>
					<path d="M6 6L18 18M18 6L6 18" />
				</svg>
			</button>
		</div>

		<!-- MAIN LINKS -->
		<div class="px-5">
			{#each navLinks as link, i (link.href)}
				<a
					href={link.href}
					onclick={closeMenu}
					class="group flex items-center justify-between border-b border-white/10 py-4.5"
				>
					<div class="flex items-center gap-4">
						<span class="w-5 text-[10px] font-medium text-[#f98315]">
							{String(i + 1).padStart(2, '0')}
						</span>

						<span
							class="text-[21px] font-semibold tracking-tight transition-colors group-hover:text-[#f98315]"
						>
							{link.label}
						</span>
					</div>

					<span
						class="text-lg text-white/25 transition group-hover:translate-x-1 group-hover:text-[#f98315]"
					>
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
						class="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:border-[#f98315]/40 hover:bg-[#f98315] hover:text-black active:bg-[#f98315] active:text-black"
					>
						{destination.name}
					</a>
				{/each}
			</div>
		</div>

		<!-- ACCOUNT / BOOKING AREA -->
		<div class="px-5 pb-10">
			{#if page.data.session?.user}
				<div class="mb-3 grid grid-cols-2 gap-2">
					<a
						href="/account/bookings"
						onclick={closeMenu}
						class="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-white/80 transition hover:bg-white/10"
					>
						My Bookings
					</a>

					<a
						href="/account/profile"
						onclick={closeMenu}
						class="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm text-white/80 transition hover:bg-white/10"
					>
						Profile
					</a>
				</div>
			{:else}
				<a
					href="/login"
					onclick={closeMenu}
					class="mb-3 flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
				>
					Log in to your account
				</a>
			{/if}

			<!-- BOOK CTA -->
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

			{#if page.data.session?.user}
				<button type="button" onclick={handleSignOut} class="mt-4 w-full py-2 text-xs text-red-400">
					Log out
				</button>
			{/if}
		</div>
	</div>
{/if}
