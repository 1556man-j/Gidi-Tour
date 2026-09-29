<script>
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';
	import { tourStore } from '$lib/stores/tourStore.svelte';
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
		{ label: 'Store', href: '/store' },
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
		class="mx-auto flex h-17 max-w-360 items-center border border-white/10 bg-black/55 px-4 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out lg:px-6"
	>
		<!-- LOGO -->
		<a
			href="/"
			aria-label="Gidi Tour home"
			class="group mr-auto flex shrink-0 flex-col leading-none w-24"
		>
			<!-- <span
				class="text-[22px] font-bold tracking-[-0.04em] text-white transition-transform duration-300 group-hover:-translate-y-0.5 lg:text-[25px]"
			>
				GIDI<span class="text-[#f98315]">×</span>
			</span>

			<span class="text-[11px] font-bold tracking-[0.25em] text-[#f98315] lg:text-xs"> TOUR </span> -->
			<img src="images/assets/LOGO-3.png" alt="logo" class="w-full" />
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
						class="absolute bottom-1 left-1/2 h-0.5 w-0 -translate-x-1/2 rounded-full bg-[#f98315] transition-all duration-300 group-hover:w-4"
					></span>
				</a>
			{/each}
		</div>

		<!-- RIGHT SIDE -->
		<div class="ml-3 flex items-center gap-2 lg:ml-5">
			<!-- TOUR -->
			<button
				type="button"
				onclick={() => tourStore.toggleSidebar()}
				aria-label="Your tour list"
				class="group relative hidden h-14 w-14 items-center justify-center rounded-full text-white/70 transition hover:bg-white/5 hover:text-white lg:flex"
			>
				<svg
					class="h-6 w-6"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.7"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8" />
					<path d="M16 11V7a4 4 0 0 0-8 0v4" />
				</svg>

				{#if tourStore.count > 0}
					<span
						class="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f98315] px-1 text-[10px] font-bold text-black"
					>
						{tourStore.count}
					</span>
				{/if}

				<!-- TOOLTIP -->
				<span
					class="pointer-events-none absolute right-0 top-full mt-2 translate-y-1 whitespace-nowrap rounded-lg border border-white/10 bg-black/90 px-3 py-1.5 text-[11px] text-white opacity-0 shadow-2xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
				>
					{tourStore.count > 0 ? `${tourStore.count} in your tour` : 'Your tour list is empty'}
				</span>
			</button>

			<!-- BOOK BUTTON -->
			<a
				href="/book"
				class="group flex h-10 items-center gap-2 rounded-full bg-[#f98315] px-4 text-xs font-bold text-black transition-all duration-300 hover:scale-[1.03] hover:bg-[#FFD54F] lg:px-5"
			>
				<span>Book a Tour</span>

				<span
					class="flex h-6 w-6 items-center justify-center rounded-full bg-black text-white transition-transform duration-300 group-hover:translate-x-0.5"
				>
					→
				</span>
			</a>

			{#if page.data.session?.user}
				{@const account = page.data.customer}
				{@const displayName =
					account?.name ?? page.data.session.user.name ?? page.data.session.user.email ?? '?'}
				<div class="relative group">
					<button
						type="button"
						>{#if account?.avatarUrl}
							<img src={account.avatarUrl} alt="" class="h-11 w-11 object-cover rounded-full border border-[#f98315]/70" />
						{:else}
							<div
								class="flex h-10 w-10 text-xl items-center justify-center rounded-full border-2 border-[#f98315]/90 font-bold text-[#eef4e7]"
							>
								{displayName.charAt(0).toUpperCase()}
							</div>
						{/if}
					</button>
					<div
						class="absolute right-0 top-full mt-2 hidden w-48 rounded-2xl border border-black/10 bg-white p-2 shadow-lg group-hover:block"
					>
						<a
							href="/account/bookings"
							class="block rounded-xl px-3 py-2 text-sm text-[#17200f] hover:bg-black/5"
							>My Bookings</a
						>
						<a
							href="/account/profile"
							class="block rounded-xl px-3 py-2 text-sm text-[#17200f] hover:bg-black/5">Profile</a
						>
						<button
							type="button"
							onclick={() => signOut({ callbackUrl: '/' })}
							class="block w-full rounded-xl px-3 py-2 text-left text-sm text-red-500 hover:bg-black/5"
							>Log out</button
						>
					</div>
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
		</div>
	</nav>
</header>
