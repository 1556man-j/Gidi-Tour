<script lang="ts">
	import { onMount, type ComponentProps } from 'svelte';
	import { ArrowRight, ArrowLeft, Check, ShoppingBag, Minus, Plus, X } from 'lucide-svelte';
	import { storeCart } from '$lib/stores/storeCart.svelte';
	import Price from './Price.svelte';
	import StripePaymentForm from './StripePaymentForm.svelte';

	// Same currency type that Price expects, so the two can never drift apart.
	type CurrencyInfo = ComponentProps<typeof Price>['currency'];

	interface Props {
		currency: CurrencyInfo;
		rate: number | null;
		paymentProvider: 'stripe' | 'dlocal';
		countryCode: string;
		// Logged-in user's saved profile (null for guests). Used to auto-fill the form.
		customer?: {
			name?: string;
			email?: string;
			address?: {
				line1?: string;
				line2?: string;
				city?: string;
				postalCode?: string;
				country?: string;
			};
		} | null;
	}

	let { currency, rate, paymentProvider, countryCode, customer = null }: Props = $props();

	let cartOpen = $state(false);

	// 'details' -> step 1 of checkout; 'payment' -> step 2
	let checkoutStep = $state<'details' | 'payment'>('details');
	let checkingOut = $state(false);

	let email = $state('');
	let name = $state('');
	// Shipping: only required if the cart has merchandise
	let shippingAddress = $state('');
	let shippingCity = $state('');
	let shippingCountry = $state('');
	let shippingPostcode = $state('');

	let error = $state('');
	let loading = $state(false);
	let submitted = $state(false);
	let claimedFree = $state(false);

	const emailValid = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

	// Everything in the cart is free, so there is nothing to pay for.
	const allFree = $derived(storeCart.items.length > 0 && storeCart.subtotal === 0);

	const detailsValid = $derived(() => {
		if (!name.trim() || !emailValid) return false;
		if (storeCart.hasMerchandise) {
			return Boolean(
				shippingAddress.trim() &&
				shippingCity.trim() &&
				shippingCountry.trim() &&
				shippingPostcode.trim()
			);
		}
		return true;
	});

	// Fill the form from the saved profile. Only fills fields that are still empty,
	// so anything the user already typed is never overwritten. Everything stays editable.
	function prefillFromProfile() {
		if (!customer) return;

		if (!name) name = customer.name ?? '';
		if (!email) email = customer.email ?? '';

		if (!shippingAddress) {
			shippingAddress = [customer.address?.line1, customer.address?.line2]
				.filter(Boolean)
				.join(', ');
		}
		if (!shippingCity) shippingCity = customer.address?.city ?? '';
		if (!shippingPostcode) shippingPostcode = customer.address?.postalCode ?? '';
		if (!shippingCountry) shippingCountry = customer.address?.country ?? '';
	}

	function openCart() {
		cartOpen = true;
	}

	export function open() {
		openCart();
	}

	function closeCart() {
		cartOpen = false;
	}

	onMount(() => {
		const handler = () => openCart();
		window.addEventListener('gt-cart-open', handler);
		storeCart.hydrate();
		return () => window.removeEventListener('gt-cart-open', handler);
	});

	function startCheckout() {
		prefillFromProfile();
		checkingOut = true;
		checkoutStep = 'details';
	}

	function backToCart() {
		checkingOut = false;
		error = '';
	}

	function goToPayment() {
		error = '';
		if (!detailsValid()) {
			error = storeCart.hasMerchandise
				? 'Please fill in your name, email and shipping address.'
				: 'Please enter a valid name and email.';
			return;
		}
		checkoutStep = 'payment';
	}

	// =========================================================
	// FREE ORDER (no payment)
	// =========================================================

	async function claimFree(): Promise<void> {
		error = '';
		if (!detailsValid()) {
			error = 'Please enter a valid name and email.';
			return;
		}

		loading = true;

		try {
			const res = await fetch('/api/store/checkout/free', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					email: email.trim(),
					items: storeCart.items.map((item) => ({ id: item.id }))
				})
			});
			const result = await res.json();

			if (!res.ok) {
				error = result.error ?? 'Could not complete your order.';
				return;
			}

			claimedFree = true;
			submitted = true;
			storeCart.clear();
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	// =========================================================
	// PAYMENT
	// =========================================================

	let stripeClientSecret = $state<string | null>(null);
	let stripeOrderId = $state<string | null>(null);
	let dlocalRedirecting = $state(false);

	const orderPayload = $derived({
		email: email.trim(),
		name: name.trim(),
		items: storeCart.items.map((item) => ({
			id: item.id,
			category: item.category,
			title: item.title,
			price: item.price,
			quantity: item.quantity,
			variant: item.variant
		})),
		subtotal: storeCart.subtotal,
		shipping: storeCart.hasMerchandise
			? {
					address: shippingAddress.trim(),
					city: shippingCity.trim(),
					country: shippingCountry.trim(),
					postcode: shippingPostcode.trim()
				}
			: null,
		currencyCode: currency.code
	});

	async function startPayment(): Promise<void> {
		error = '';

		if (allFree) {
			await claimFree();
			return;
		}

		if (!detailsValid()) {
			error = 'Please complete your details first.';
			checkoutStep = 'details';
			return;
		}

		const convertedAmount =
			rate !== null ? Math.round(storeCart.subtotal * rate) : storeCart.subtotal;
		loading = true;

		try {
			if (paymentProvider === 'stripe') {
				const res = await fetch('/api/store/checkout/stripe/init', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...orderPayload, convertedAmount })
				});
				const initData = await res.json();

				if (!res.ok) {
					error = initData.error ?? 'Could not start payment.';
					return;
				}

				stripeClientSecret = initData.clientSecret;
				stripeOrderId = initData.orderId;
			} else {
				const res = await fetch('/api/store/checkout/dlocal/init', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...orderPayload, convertedAmount, countryCode })
				});
				const initData = await res.json();

				if (!res.ok) {
					error = initData.error ?? 'Could not start payment.';
					return;
				}

				dlocalRedirecting = true;
				window.location.href = initData.redirectUrl;
			}
		} catch {
			error = 'Network error. Please try again.';
		} finally {
			loading = false;
		}
	}

	function handleStripeSuccess() {
		submitted = true;
		storeCart.clear();
	}

	function handleStripeError(msg: string) {
		error = msg;
	}

	function resetAndClose() {
		closeCart();
		setTimeout(() => {
			submitted = false;
			claimedFree = false;
			checkingOut = false;
			checkoutStep = 'details';
			stripeClientSecret = null;
			stripeOrderId = null;
			name = '';
			email = '';
			shippingAddress = '';
			shippingCity = '';
			shippingCountry = '';
			shippingPostcode = '';
		}, 300);
	}
</script>

<!-- FLOATING CART BUTTON -->
{#if storeCart.count > 0 && !cartOpen}
	<button
		type="button"
		onclick={openCart}
		class="fixed bottom-6 left-6 z-9999999 inline-flex items-center gap-2 rounded-full bg-[#17200f] px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:scale-105"
	>
		<ShoppingBag class="h-4 w-4" aria-hidden="true" />
		{storeCart.count} item{storeCart.count > 1 ? 's' : ''}
		{#if allFree}
			Free
		{:else}
			<Price amountGBP={storeCart.subtotal} {currency} {rate} size="sm" />
		{/if}
	</button>
{/if}

<!-- CART / CHECKOUT DRAWER -->
{#if cartOpen}
	<div class="fixed inset-0 z-9999999999 flex justify-end">
		<button
			type="button"
			aria-label="Close cart"
			onclick={submitted ? resetAndClose : closeCart}
			class="absolute inset-0 bg-black/40"
		></button>

		<div class="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
			<!-- Drawer header -->
			<div class="flex items-center justify-between border-b border-black/10 p-5">
				<p class="text-lg font-bold text-[#17200f]">
					{#if submitted}
						Order complete
					{:else if checkingOut}
						{checkoutStep === 'details' ? 'Your details' : 'Payment'}
					{:else}
						Your cart
					{/if}
				</p>
				<button
					type="button"
					aria-label="Close"
					onclick={submitted ? resetAndClose : closeCart}
					class="text-[#17200f]/40 transition hover:text-[#17200f]"
				>
					<X class="h-5 w-5" aria-hidden="true" />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-5">
				{#if submitted}
					<!-- SUCCESS -->
					<div class="flex flex-col items-center py-10 text-center">
						<div
							class="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#5C9B19]/10"
						>
							<Check class="h-7 w-7 text-[#5C9B19]" aria-hidden="true" />
						</div>
						<p class="text-xl font-medium text-[#17200f]">Thanks{name ? `, ${name}` : ''}!</p>
						{#if claimedFree}
							<p class="mt-2 max-w-xs text-sm leading-relaxed text-[#17200f]/60">
								Your free download link is on its way to {email}. It's yours to keep, and you can
								open it again any time from that email.
							</p>
						{:else}
							<p class="mt-2 max-w-xs text-sm leading-relaxed text-[#17200f]/60">
								A receipt is on its way to {email}. Your permanent magazine downloads (if any) are
								available from the link in that email, and any merchandise will ship with tracking
								details sent separately.
							</p>
						{/if}
						{#if customer}
							<a
								href="/account/bookings"
								class="mt-6 inline-flex rounded-full bg-[#5C9B19] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#4c8316]"
							>
								View in My Bookings
							</a>
						{/if}
					</div>
				{:else if !checkingOut}
					<!-- CART CONTENTS -->
					{#if storeCart.items.length === 0}
						<p class="py-10 text-center text-sm text-[#17200f]/50">Your cart is empty.</p>
					{:else}
						<div class="flex flex-col gap-3">
							{#each storeCart.items as item (item.id + (item.variant ?? ''))}
								<div class="flex items-center gap-3 rounded-2xl border border-black/10 p-3">
									<img
										src={item.image}
										alt={item.title}
										class="h-14 w-14 shrink-0 rounded-xl object-cover"
									/>
									<div class="min-w-0 flex-1">
										<p class="truncate text-sm font-semibold text-[#17200f]">{item.title}</p>
										{#if item.variant}
											<p class="text-xs text-[#17200f]/50">{item.variant}</p>
										{/if}
										<p class="text-xs text-[#17200f]/50">
											{#if item.price === 0}
												<span class="font-bold text-[#5C9B19]">Free</span>
											{:else}
												<Price amountGBP={item.price} {currency} {rate} size="sm" />
											{/if}
										</p>
									</div>

									{#if item.category === 'merchandise'}
										<div
											class="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1"
										>
											<button
												type="button"
												aria-label="Decrease quantity"
												onclick={() =>
													storeCart.setQuantity(item.id, item.quantity - 1, item.variant)}
												class="flex h-10 w-10 items-center justify-center rounded-full text-[#17200f]/60 hover:bg-black/5"
											>
												<Minus class="h-3 w-3 text-[#17200f]/60" aria-hidden="true" />
											</button>
											<span class="w-4 text-center text-xs font-bold text-[#17200f]">
												{item.quantity}
											</span>
											<button
												type="button"
												aria-label="Increase quantity"
												onclick={() =>
													storeCart.setQuantity(item.id, item.quantity + 1, item.variant)}
												class="flex h-10 w-10 items-center justify-center rounded-full text-[#17200f]/60 hover:bg-black/5"
											>
												<Plus class="h-3 w-3 " aria-hidden="true" />
											</button>
										</div>
									{:else}
										<button
											type="button"
											aria-label={`Remove ${item.title}`}
											onclick={() => storeCart.remove(item.id, item.variant)}
											class="text-xs font-semibold text-[#17200f]/40 transition hover:text-red-500"
										>
											Remove
										</button>
									{/if}
								</div>
							{/each}
						</div>
					{/if}
				{:else if checkoutStep === 'details'}
					<!-- CHECKOUT: DETAILS -->
					<div class="flex flex-col gap-4">
						{#if customer}
							<p class="rounded-2xl bg-[#5C9B19]/10 px-4 py-3 text-xs text-[#17200f]/70">
								Filled in from your profile. You can change anything for this order.
							</p>
						{/if}

						<div class="flex flex-col gap-1.5">
							<label for="store-name" class="text-xs font-medium text-[#17200f]/60">Full name</label
							>
							<input
								id="store-name"
								type="text"
								autocomplete="name"
								bind:value={name}
								placeholder="Adaeze Okafor"
								class="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label for="store-email" class="text-xs font-medium text-[#17200f]/60">Email</label>
							<input
								id="store-email"
								type="email"
								autocomplete="email"
								bind:value={email}
								placeholder="you@example.com"
								class="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
							/>
							{#if storeCart.hasMagazine}
								<p class="text-xs text-[#17200f]/45">
									Your permanent download links are sent here.
								</p>
							{/if}
						</div>

						{#if storeCart.hasMerchandise}
							<p class="mt-2 text-xs font-bold uppercase tracking-widest text-[#5C9B19]">
								Shipping address
							</p>
							<div class="flex flex-col gap-1.5">
								<label for="store-address" class="text-xs font-medium text-[#17200f]/60"
									>Address</label
								>
								<input
									id="store-address"
									type="text"
									autocomplete="street-address"
									bind:value={shippingAddress}
									class="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
								/>
							</div>
							<div class="grid grid-cols-2 gap-3">
								<div class="flex flex-col gap-1.5">
									<label for="store-city" class="text-xs font-medium text-[#17200f]/60">City</label>
									<input
										id="store-city"
										type="text"
										autocomplete="address-level2"
										bind:value={shippingCity}
										class="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
									/>
								</div>
								<div class="flex flex-col gap-1.5">
									<label for="store-postcode" class="text-xs font-medium text-[#17200f]/60"
										>Postcode</label
									>
									<input
										id="store-postcode"
										type="text"
										autocomplete="postal-code"
										bind:value={shippingPostcode}
										class="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
									/>
								</div>
							</div>
							<div class="flex flex-col gap-1.5">
								<label for="store-country" class="text-xs font-medium text-[#17200f]/60"
									>Country</label
								>
								<input
									id="store-country"
									type="text"
									autocomplete="country-name"
									bind:value={shippingCountry}
									class="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
								/>
							</div>
						{/if}

						{#if error}
							<p class="text-sm text-[#F98315]" role="alert">{error}</p>
						{/if}
					</div>
				{:else}
					<!-- CHECKOUT: PAYMENT -->
					<div class="flex flex-col gap-4">
						<div class="rounded-2xl bg-[#f7f3ea] p-4">
							<div class="flex items-center justify-between text-sm">
								<span class="text-[#17200f]/60">Subtotal</span>
								<span class="font-bold text-[#17200f]">
									<Price amountGBP={storeCart.subtotal} {currency} {rate} size="sm" />
								</span>
							</div>
						</div>

						{#if paymentProvider === 'stripe' && stripeClientSecret}
							<StripePaymentForm
								clientSecret={stripeClientSecret}
								bookingId={stripeOrderId ?? ''}
								returnPath={`/store/confirmation?orderId=${encodeURIComponent(stripeOrderId ?? '')}`}
								onSuccess={handleStripeSuccess}
								onError={handleStripeError}
							/>
						{:else if paymentProvider === 'dlocal'}
							<p class="text-sm text-[#17200f]/60">
								You'll be redirected to complete payment via your local bank or mobile money
								provider.
							</p>
						{/if}

						{#if error}
							<p class="text-sm text-[#F98315]" role="alert">{error}</p>
						{/if}
					</div>
				{/if}
			</div>

			<!-- DRAWER FOOTER -->
			{#if !submitted}
				<div class="border-t border-black/10 p-5">
					{#if !checkingOut}
						<div class="mb-4 flex items-center justify-between">
							<span class="text-sm text-[#17200f]/60">Subtotal</span>
							<span class="text-lg font-bold text-[#5C9B19]">
								{#if allFree}
									Free
								{:else}
									<Price amountGBP={storeCart.subtotal} {currency} {rate} size="sm" />
								{/if}
							</span>
						</div>
						<button
							type="button"
							disabled={storeCart.items.length === 0}
							onclick={startCheckout}
							class="flex w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:cursor-not-allowed disabled:opacity-40"
						>
							{allFree ? 'Get my free copy' : 'Checkout'}
							<ArrowRight class="h-4 w-4" aria-hidden="true" />
						</button>
					{:else if checkoutStep === 'details'}
						<div class="flex items-center justify-between gap-3">
							<button
								type="button"
								onclick={backToCart}
								class="inline-flex items-center gap-1.5 text-sm font-bold text-[#17200f]/60 hover:text-[#17200f]"
							>
								<ArrowLeft class="h-4 w-4" aria-hidden="true" />
								Back
							</button>
							{#if allFree}
								<button
									type="button"
									onclick={claimFree}
									disabled={loading}
									class="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:cursor-not-allowed disabled:opacity-40"
								>
									{loading ? 'Sending…' : 'Get my free copy'}
								</button>
							{:else}
								<button
									type="button"
									onclick={goToPayment}
									class="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4c8316]"
								>
									Continue to payment
									<ArrowRight class="h-4 w-4" aria-hidden="true" />
								</button>
							{/if}
						</div>
					{:else}
						<div class="flex items-center justify-between gap-3">
							<button
								type="button"
								onclick={() => (checkoutStep = 'details')}
								class="inline-flex items-center gap-1.5 text-sm font-bold text-[#17200f]/60 hover:text-[#17200f]"
							>
								<ArrowLeft class="h-4 w-4" aria-hidden="true" />
								Back
							</button>
							{#if paymentProvider === 'stripe' && !stripeClientSecret}
								<button
									type="button"
									onclick={startPayment}
									disabled={loading}
									class="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:cursor-not-allowed disabled:opacity-40"
								>
									{loading ? 'Loading…' : 'Pay now'}
								</button>
							{:else if paymentProvider === 'dlocal'}
								<button
									type="button"
									onclick={startPayment}
									disabled={loading || dlocalRedirecting}
									class="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:cursor-not-allowed disabled:opacity-40"
								>
									{loading || dlocalRedirecting ? 'Redirecting…' : 'Pay now'}
								</button>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>
{/if}