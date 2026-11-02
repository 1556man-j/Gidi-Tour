<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, tick } from 'svelte';
	import { Lock } from 'lucide-svelte';
	import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';

	interface Props {
		caseSlug?: string | null;
		caseTitle?: string;
		currency: { code: string };
		rate: number | null;
		provider: 'stripe' | 'dlocal';
		customer?: { name?: string; email?: string } | null;
		presets: number[];
		minGBP: number;
		maxGBP: number;
	}

	let {
		caseSlug = null,
		caseTitle,
		currency,
		rate,
		provider,
		customer = null,
		presets,
		minGBP,
		maxGBP
	}: Props = $props();

	// Prices are set in pounds. They are shown, and charged, in the visitor's currency
	// where the site supports it; if the rate is unavailable the server charges pounds,
	// so the form shows pounds too.
	const converted = $derived(
		rate !== null && rate > 0 && currency.code.toUpperCase() !== 'GBP'
	);
	const code = $derived(converted ? currency.code.toUpperCase() : 'GBP');

	function localOf(gbp: number) {
		return converted ? Math.round(gbp * (rate as number)) : gbp;
	}

	function money(amount: number) {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: code,
			maximumFractionDigits: code === 'GBP' && !Number.isInteger(amount) ? 2 : 0
		}).format(amount);
	}

	let selected = $state<number | 'custom'>(presets[2] ?? presets[0]);
	let custom = $state('');
	let name = $state(customer?.name ?? '');
	let email = $state(customer?.email ?? '');
	let message = $state('');
	let anonymous = $state(false);

	let loading = $state(false);
	let paying = $state(false);
	let error = $state('');

	let clientSecret = $state('');
	let donationId = $state('');
	let paymentHost = $state<HTMLDivElement>();

	let stripe: Stripe | null = null;
	let elements: StripeElements | null = null;

	const minLocal = $derived(localOf(minGBP));
	const maxLocal = $derived(localOf(maxGBP));

	const amount = $derived.by(() => {
		if (selected === 'custom') {
			const value = Number(custom);
			return Number.isFinite(value) && value > 0 ? value : 0;
		}
		return localOf(selected);
	});

	const locked = $derived(Boolean(clientSecret));

	function validate(): string {
		if (!name.trim()) return 'Please enter your name.';
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Please enter a valid email address.';
		if (amount < minLocal) return `The smallest donation is ${money(minLocal)}.`;
		if (amount > maxLocal) return `For gifts above ${money(maxLocal)}, please contact us.`;
		return '';
	}

	async function start() {
		error = validate();
		if (error) return;

		loading = true;

		try {
			const res = await fetch(
				provider === 'dlocal'
					? '/api/gidicare/donate/dlocal/init'
					: '/api/gidicare/donate/stripe/init',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						preset: selected === 'custom' ? undefined : selected,
						customAmount: selected === 'custom' ? Number(custom) : undefined,
						name: name.trim(),
						email: email.trim(),
						message: message.trim() || undefined,
						anonymous,
						caseSlug
					})
				}
			);

			const data = await res.json();

			if (!res.ok) throw new Error(data.error || 'Could not start your donation. Please try again.');

			if (provider === 'dlocal') {
				if (!data.redirectUrl) throw new Error('Could not start your donation. Please try again.');
				window.location.href = data.redirectUrl;
				return; // leaving the page
			}

			clientSecret = data.clientSecret;
			donationId = data.donationId;

			stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);
			if (!stripe) throw new Error('Card payments are unavailable right now. Please try again later.');

			await tick();

			elements = stripe.elements({
				clientSecret,
				appearance: {
					theme: 'stripe',
					variables: { colorPrimary: '#5C9B19', borderRadius: '12px' }
				}
			});

			elements.create('payment', { layout: 'tabs' }).mount(paymentHost as HTMLDivElement);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
			clientSecret = '';
		} finally {
			loading = false;
		}
	}

	async function pay() {
		if (!stripe || !elements) return;

		paying = true;
		error = '';

		const result = await stripe.confirmPayment({
			elements,
			confirmParams: {
				return_url: `${window.location.origin}/gidicare/thank-you?donationId=${donationId}`,
				receipt_email: email.trim()
			},
			redirect: 'if_required'
		});

		if (result.error) {
			error = result.error.message ?? 'The payment could not be completed.';
			paying = false;
			return;
		}

		paying = false;
		await goto(`/gidicare/thank-you?donationId=${donationId}`);
	}

	function startOver() {
		elements?.getElement('payment')?.destroy();
		elements = null;
		clientSecret = '';
		donationId = '';
		error = '';
	}

	onDestroy(() => {
		elements?.getElement('payment')?.destroy();
	});
</script>

<div class="rounded-3xl bg-white p-6 text-[#17200f] shadow-xl sm:p-8">
	<h2 class="flex items-center gap-2 text-2xl font-bold">
		{caseTitle ? `Help ${caseTitle}` : 'Make a donation'}
	</h2>
	<p class="mt-1 text-sm text-[#17200f]/60">
		{caseTitle
			? 'Your gift goes toward this animal’s care.'
			: 'Your gift supports stray and injured animals.'}
	</p>

	<!-- Amounts -->
	<fieldset class="mt-6" disabled={locked}>
		<legend class="text-sm font-bold">Choose an amount</legend>
		<div class="mt-3 grid grid-cols-3 gap-2">
			{#each presets as preset}
				<button
					type="button"
					aria-pressed={selected === preset}
					onclick={() => (selected = preset)}
					class="rounded-xl border px-2 py-3 text-sm font-bold transition disabled:opacity-60 {selected ===
					preset
						? 'border-[#5C9B19] bg-[#5C9B19] text-white'
						: 'border-black/15 bg-white text-[#17200f] hover:border-black/40'}"
				>
					{money(localOf(preset))}
				</button>
			{/each}
			<button
				type="button"
				aria-pressed={selected === 'custom'}
				onclick={() => (selected = 'custom')}
				class="rounded-xl border px-2 py-3 text-sm font-bold transition disabled:opacity-60 {selected ===
				'custom'
					? 'border-[#5C9B19] bg-[#5C9B19] text-white'
					: 'border-black/15 bg-white text-[#17200f] hover:border-black/40'}"
			>
				Other
			</button>
		</div>

		{#if selected === 'custom'}
			<label class="mt-3 block text-sm font-semibold" for="gc-custom">
				Amount ({code})
				<input
					id="gc-custom"
					type="number"
					inputmode="decimal"
					min={minLocal}
					max={maxLocal}
					step={code === 'GBP' ? '0.01' : '1'}
					bind:value={custom}
					placeholder={`${minLocal} or more`}
					class="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-base font-normal outline-none focus:border-[#5C9B19]"
				/>
			</label>
		{/if}
	</fieldset>

	<!-- Details -->
	<fieldset class="mt-6 space-y-3" disabled={locked}>
		<label class="block text-sm font-semibold" for="gc-name">
			Your name
			<input
				id="gc-name"
				type="text"
				autocomplete="name"
				bind:value={name}
				class="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-base font-normal outline-none focus:border-[#5C9B19] disabled:bg-black/5"
			/>
		</label>
		<label class="block text-sm font-semibold" for="gc-email">
			Email (for your receipt)
			<input
				id="gc-email"
				type="email"
				autocomplete="email"
				bind:value={email}
				class="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-base font-normal outline-none focus:border-[#5C9B19] disabled:bg-black/5"
			/>
		</label>
		<label class="block text-sm font-semibold" for="gc-message">
			A message for the team (optional)
			<textarea
				id="gc-message"
				rows="2"
				maxlength="300"
				bind:value={message}
				class="mt-1 w-full rounded-xl border border-black/15 px-4 py-3 text-base font-normal outline-none focus:border-[#5C9B19] disabled:bg-black/5"
			></textarea>
			<span class="text-xs font-normal text-[#17200f]/50">Private. We never show messages on the site.</span>
		</label>
		<label class="flex items-start gap-2 text-sm">
			<input type="checkbox" bind:checked={anonymous} class="mt-1 h-4 w-4 accent-[#5C9B19]" />
			<span>Give anonymously (don’t show my first name under “Recent supporters”)</span>
		</label>
	</fieldset>

	{#if clientSecret}
		<div bind:this={paymentHost} class="mt-6"></div>
	{/if}

	{#if error}
		<p class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
			{error}
		</p>
	{/if}

	{#if clientSecret}
		<button
			type="button"
			onclick={pay}
			disabled={paying}
			class="mt-5 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-4 text-base font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-60"
		>
			{paying ? 'Processing…' : `Donate ${money(amount)}`}
		</button>
		<button
			type="button"
			onclick={startOver}
			disabled={paying}
			class="mt-3 w-full text-center text-sm font-semibold text-[#17200f]/60 hover:text-[#17200f]"
		>
			Change amount or details
		</button>
	{:else}
		<button
			type="button"
			onclick={start}
			disabled={loading}
			class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-4 text-base font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-60"
		>
			{#if loading}
				Please wait…
			{:else if amount > 0}
				{provider === 'dlocal' ? 'Continue to payment' : 'Continue'} · {money(amount)}
			{:else}
				Choose an amount
			{/if}
		</button>
	{/if}

	<p class="mt-4 flex items-center justify-center gap-1.5 text-xs text-[#17200f]/50">
		<Lock class="h-3.5 w-3.5" aria-hidden="true" />
		{provider === 'dlocal'
			? 'You will be taken to dLocal to pay securely.'
			: 'Payments are processed securely by Stripe. We never see your card details.'}
	</p>
</div>
