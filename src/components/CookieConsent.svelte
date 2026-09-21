<script lang="ts">
	import { onMount } from 'svelte';

	const CONSENT_KEY = 'gidi_cookie_consent';
	const GA_ID = 'G-YW1HK7XNWF';

	type Consent = {
		necessary: true;
		analytics: boolean;
	};

	let visible = $state(false);
	let showPreferences = $state(false);
	let analytics = $state(false);

	function loadGoogleAnalytics() {
		if (typeof window === 'undefined') return;

		// Don't load Google Analytics more than once
		if (document.getElementById('gidi-ga-script')) return;

		window.dataLayer = window.dataLayer || [];

		window.gtag = (...args: unknown[]) => {
			window.dataLayer.push(args);
		};

		window.gtag('js', new Date());
		window.gtag('config', GA_ID, {
			anonymize_ip: true
		});

		const script = document.createElement('script');
		script.id = 'gidi-ga-script';
		script.async = true;
		script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;

		document.head.appendChild(script);
	}

	function saveConsent(analyticsAllowed: boolean) {
		const consent: Consent = {
			necessary: true,
			analytics: analyticsAllowed
		};

		localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));

		analytics = analyticsAllowed;
		visible = false;
		showPreferences = false;

		if (analyticsAllowed) {
			loadGoogleAnalytics();
		}
	}

	function acceptAll() {
		saveConsent(true);
	}

	function rejectOptional() {
		saveConsent(false);
	}

	function savePreferences() {
		saveConsent(analytics);
	}

	function openPreferences() {
		showPreferences = true;
	}

	onMount(() => {
		const stored = localStorage.getItem(CONSENT_KEY);

		if (!stored) {
			visible = true;
			return;
		}

		try {
			const consent = JSON.parse(stored) as Consent;

			analytics = consent.analytics === true;

			if (analytics) {
				loadGoogleAnalytics();
			}
		} catch {
			localStorage.removeItem(CONSENT_KEY);
			visible = true;
		}

		const handleOpenSettings = () => {
			showPreferences = true;
		};

		window.addEventListener('gidi:open-cookie-settings', handleOpenSettings);

		return () => {
			window.removeEventListener('gidi:open-cookie-settings', handleOpenSettings);
		};
	});
</script>

{#if visible}
	<div
		class="fixed inset-0 z-9998 bg-black/20"
		aria-hidden="true"
	></div>

	<section
		class="fixed bottom-3 left-3 right-3 z-9999 rounded-2xl border border-black/10 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.20)] sm:bottom-5 sm:left-5 sm:right-5 max-w-240 mx-auto"
		aria-label="Cookie preferences"
	>
		<div
			class="mx-auto flex max-w-300 flex-col gap-5 px-5 py-5 sm:px-7 sm:py-6 "
		>
			<div class="min-w-0">
				<p
					class="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#5c9b19]"
				>
					Your privacy matters
				</p>

				<h2 class="mb-2 text-xl font-bold text-[#17200f] sm:text-[22px]">
					We use cookies
				</h2>

				<p class="mb-2 max-w-3xl text-sm leading-6 text-[#596052]">
					We use necessary technologies to keep Gidi Tour working and optional
					analytics cookies to understand how visitors use our website and improve
					the experience.
				</p>

				<a
					href="/cookies"
					class="text-sm font-semibold text-[#5c9b19] transition hover:text-[#477a13]"
				>
					Learn more about our cookies
				</a>
			</div>

			<div
				class="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap md:justify-end"
			>
				<button
					type="button"
					class="rounded-[10px] bg-[#f2f4ef] px-4 py-3 text-sm font-bold text-[#25301e] transition hover:bg-[#e6e9e2]"
					onclick={rejectOptional}
				>
					Reject optional
				</button>

				<button
					type="button"
					class="rounded-[10px] bg-[#f2f4ef] px-4 py-3 text-sm font-bold text-[#25301e] transition hover:bg-[#e6e9e2]"
					onclick={openPreferences}
				>
					Manage preferences
				</button>

				<button
					type="button"
					class="rounded-[10px] bg-[#5c9b19] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4d8516]"
					onclick={acceptAll}
				>
					Accept all
				</button>
			</div>
		</div>
	</section>
{/if}

{#if showPreferences}
	<div
		class="fixed inset-0 z-10000 grid place-items-center bg-black/50 p-5"
		role="presentation"
	>
		<div
			class="relative w-full max-w-140 rounded-2xl bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.30)] sm:p-8"
			role="dialog"
			aria-modal="true"
			aria-labelledby="cookie-preferences-title"
		>
			<button
				type="button"
				class="absolute right-4 top-3 rounded-lg bg-transparent px-2 py-1 text-2xl leading-none text-black/60 transition hover:bg-black/5 hover:text-black"
				aria-label="Close cookie preferences"
				onclick={() => (showPreferences = false)}
			>
				×
			</button>

			<p
				class="mb-1.5 text-xs font-bold uppercase tracking-[0.08em] text-[#5c9b19]"
			>
				Cookie settings
			</p>

			<h2
				id="cookie-preferences-title"
				class="mb-2 text-2xl font-bold text-[#17200f]"
			>
				Choose your preferences
			</h2>

			<p class="mb-5 text-sm leading-6 text-[#596052]">
				You can choose which optional technologies you allow. Necessary
				technologies cannot be switched off because they help the website
				function properly.
			</p>

			<div class="flex items-center justify-between gap-5 border-b border-[#e8ebe5] py-4">
				<div>
					<strong class="block text-sm text-[#17200f]">Necessary</strong>
					<span class="mt-1 block text-sm text-[#6a7165]">
						Always active
					</span>
				</div>

				<div class="text-xs font-bold text-[#5c9b19]">
					Required
				</div>
			</div>

			<div class="flex items-center justify-between gap-5 border-b border-[#e8ebe5] py-4">
				<div>
					<strong class="block text-sm text-[#17200f]">Analytics</strong>

					<span class="mt-1 block max-w-sm text-sm text-[#6a7165]">
						Helps us understand website visits and improve Gidi Tour.
					</span>
				</div>

				<label class="relative inline-flex shrink-0 cursor-pointer items-center">
					<input
						type="checkbox"
						class="peer sr-only"
						bind:checked={analytics}
					/>

					<span
						class="h-7 w-12 rounded-full bg-[#d8ddd4] transition peer-checked:bg-[#5c9b19] peer-focus-visible:ring-2 peer-focus-visible:ring-[#5c9b19]/40 after:absolute after:left-0.75 after:top-0.75 after:h-5.5 after:w-5.5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5"
					></span>
				</label>
			</div>

			<div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
				<button
					type="button"
					class="rounded-[10px] bg-[#f2f4ef] px-4 py-3 text-sm font-bold text-[#25301e] transition hover:bg-[#e6e9e2]"
					onclick={rejectOptional}
				>
					Reject optional
				</button>

				<button
					type="button"
					class="rounded-[10px] bg-[#5c9b19] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#4d8516]"
					onclick={savePreferences}
				>
					Save preferences
				</button>
			</div>
		</div>
	</div>
{/if}