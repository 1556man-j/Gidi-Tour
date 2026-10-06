<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { Check, ArrowRight, Mail, Clock3, ShieldCheck, ShoppingBag } from 'lucide-svelte';
	import { storeCart } from '$lib/stores/storeCart.svelte';
	import SeoHead from '../../../components/SeoHead.svelte';
	import Price from '../../../components/Price.svelte';

	let { data } = $props();

	const order = $derived(data.order);
	const currency = $derived(data.currency);
	const rate = $derived(data.rate);

	const isPaid = $derived(order?.paymentStatus === 'paid');

	const displayOrderId = $derived(
		data.orderId.length > 18
			? `${data.orderId.slice(0, 10)}…${data.orderId.slice(-6)}`
			: data.orderId
	);

	// The provider can send the customer back before our webhook marks the order
	// as paid, so check again a few times.
	onMount(() => {
		storeCart.hydrate();

		const params = new URLSearchParams(window.location.search);
		if (isPaid || params.get('redirect_status') === 'succeeded') {
			storeCart.clear();
		}

		let tries = 0;
		const timer = setInterval(async () => {
			if (isPaid || tries >= 10) {
				clearInterval(timer);
				return;
			}
			tries += 1;
			await invalidateAll();
		}, 3000);

		return () => clearInterval(timer);
	});

	$effect(() => {
		if (isPaid) storeCart.clear();
	});
</script>

<SeoHead
	title="Order Confirmation | Gidi Tour Store"
	description="Your Gidi Tour store order."
	url="https://giditour.com/store/confirmation"
	siteName={data.siteSettings?.siteName ?? 'Gidi Tour'}
/>

<section
	class="relative overflow-hidden bg-[#f7f3ea] px-5 pb-12 pt-16 sm:px-8 lg:px-12 lg:pb-16 lg:pt-24"
>
	<div class="relative mx-auto max-w-3xl text-center">
		<span
			class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm"
		>
			Order Confirmation
		</span>

		<div
			class="mx-auto mt-7 flex h-20 w-20 items-center justify-center rounded-full bg-[#5C9B19]/10"
		>
			<div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#5C9B19]">
				{#if isPaid}
					<Check class="h-7 w-7 text-white" strokeWidth={3} aria-hidden="true" />
				{:else}
					<Clock3 class="h-7 w-7 text-white" aria-hidden="true" />
				{/if}
			</div>
		</div>

		{#if isPaid}
			<h1
				class="mx-auto mt-7 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
			>
				Thank you for your order!
			</h1>
			<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
				Thanks{order.name ? `, ${order.name}` : ''}. Your payment is confirmed.
			</p>
		{:else}
			<h1
				class="mx-auto mt-7 max-w-2xl text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl lg:text-6xl"
			>
				Confirming your payment
			</h1>
			<p class="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#17200f]/60">
				We've received your return from the payment provider. This page updates by itself.
			</p>
		{/if}
	</div>
</section>

<section class="bg-[#f7f3ea] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
	<div class="mx-auto max-w-3xl">
		<div class="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
			<div class="p-6 sm:p-10">
				<!-- REFERENCE + STATUS -->
				<div class="rounded-2xl bg-[#f7f3ea] p-5">
					<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]">
								Order reference
							</p>
							<p class="mt-1 break-all font-mono text-sm font-semibold text-[#17200f]">
								{displayOrderId}
							</p>
						</div>
						<div class="text-left sm:text-right">
							<p class="text-[10px] font-bold uppercase tracking-[.14em] text-[#17200f]/35">
								Status
							</p>
							<p
								class="mt-1 text-sm font-bold {isPaid ? 'text-[#5C9B19]' : 'text-[#F98315]'}"
							>
								{isPaid ? 'Paid' : 'Pending confirmation'}
							</p>
						</div>
					</div>
				</div>

				<!-- ITEMS -->
				<div class="mt-8">
					<p
						class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.14em] text-[#5C9B19]"
					>
						<ShoppingBag class="h-3.5 w-3.5" aria-hidden="true" />
						Your order
					</p>

					<div class="mt-4 flex flex-col gap-2">
						{#each order.items as item (item._key ?? item.id + (item.variant ?? ''))}
							<div
								class="flex items-center justify-between rounded-2xl bg-[#f7f3ea] px-4 py-3 text-sm"
							>
								<span class="font-medium text-[#17200f]">
									{item.title}{item.variant ? ` (${item.variant})` : ''}
								</span>
								<span class="text-[#17200f]/60">
									<Price amountGBP={item.price} {currency} {rate} size="sm" /> × {item.quantity}
								</span>
							</div>
						{/each}
					</div>

					<div class="mt-5 flex items-center justify-between border-t border-black/10 pt-5">
						<span class="font-bold text-[#17200f]">Total</span>
						<span class="text-xl font-bold text-[#5C9B19]">
							<Price amountGBP={order.subtotal} {currency} {rate} size="md" />
						</span>
					</div>
				</div>

				<!-- EMAIL -->
				<div class="mt-8 flex items-start gap-4 rounded-2xl border border-black/10 p-5">
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F98315]/10"
					>
						<Mail class="h-5 w-5 text-[#F98315]" aria-hidden="true" />
					</div>
					<div>
						<p class="text-sm font-bold text-[#17200f]">Your receipt and downloads</p>
						<p class="mt-1 text-sm leading-relaxed text-[#17200f]/55">
							{#if order.email}
								We'll send your receipt and any magazine download links to
								<span class="font-medium text-[#17200f]">{order.email}</span>.
							{:else}
								We'll send your receipt and any magazine download links to your email.
							{/if}
						</p>
					</div>
				</div>

				<!-- ACTIONS -->
				<div class="mt-8 flex flex-col gap-3 sm:flex-row">
					<a
						href="/store"
						class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#4c8316]"
					>
						Back to Store
						<ArrowRight class="h-4 w-4" aria-hidden="true" />
					</a>
					<a
						href="/account/bookings"
						class="inline-flex flex-1 items-center justify-center rounded-full border border-black/10 px-6 py-3.5 text-sm font-bold text-[#17200f]/70 transition hover:border-black/20 hover:text-[#17200f]"
					>
						View in My Bookings
					</a>
				</div>
			</div>
		</div>

		<div class="mt-6 flex items-center justify-center gap-2 text-xs text-[#17200f]/50">
			<ShieldCheck class="h-3.5 w-3.5 text-[#5C9B19]" aria-hidden="true" />
			Secure, encrypted payment
		</div>
	</div>
</section>