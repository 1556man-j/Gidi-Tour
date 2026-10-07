<script lang="ts">
	import {
		ArrowLeft,
		Calendar,
		Users,
		CreditCard,
		MapPin,
		Sparkles,
		Download,
		Package
	} from 'lucide-svelte';
	import type { PageData } from './$types';
	import AccountHeader from '../../../../components/AccountHeader.svelte';
	import Price from '../../../../components/Price.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const booking = $derived(data.booking);
	const storeOrder = $derived(data.storeOrder);
	const downloadLinks = $derived(data.downloadLinks ?? []);
	const currency = $derived(data.currency);
	const rate = $derived(data.rate);

	const addOnLabels: Record<string, string> = {
		transfers: 'Airport transfers',
		accommodation: 'Accommodation',
		food: 'Food & culture experiences',
		photo: 'Photography',
		special: 'Special occasion',
		custom: 'Something else'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
</script>

<section class="mx-auto max-w-2xl px-5 py-24">
	<a
		href="/account/bookings"
		class="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#17200f]/60 hover:text-[#17200f]"
	>
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		All bookings
	</a>

	{#if storeOrder}
		<!-- STORE ORDER -->
		<div class="rounded-[28px] border border-black/10 bg-white p-8">
			<div class="flex items-center justify-between">
				<AccountHeader customer={data.customer} title="Order details" />
				<span
					class="rounded-full bg-[#5C9B19]/10 px-3 py-1 text-xs font-bold capitalize text-[#5C9B19]"
				>
					{storeOrder.paymentStatus}
				</span>
			</div>

			<div class="mt-6 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
				<div class="flex items-center gap-2 text-sm text-[#17200f]/70">
					<Calendar class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
					Ordered {formatDate(storeOrder.createdAt)}
				</div>
				<div class="flex items-center gap-2 text-sm text-[#17200f]/70">
					<CreditCard class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
					{storeOrder.paymentMethod === 'free' ? 'Free download' : `Paid via ${storeOrder.paymentMethod}`}
				</div>
			</div>

			<div class="mt-6 border-t border-black/10 pt-6">
				<p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">
					What you ordered
				</p>
				<div class="flex flex-col gap-2">
					{#each storeOrder.items ?? [] as item (item._key ?? item.id + (item.variant ?? ''))}
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
			</div>

			{#if downloadLinks.length > 0}
				<div class="mt-6 border-t border-black/10 pt-6">
					<p
						class="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#17200f]/50"
					>
						<Download class="h-3.5 w-3.5" aria-hidden="true" />
						Your downloads
					</p>
					<div class="flex flex-col gap-2">
						{#each downloadLinks as file (file.url)}
							<a
								href={file.url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex items-center justify-between rounded-2xl border border-[#5C9B19]/30 bg-[#5C9B19]/5 px-4 py-3 text-sm font-semibold text-[#5C9B19] transition hover:bg-[#5C9B19]/10"
							>
								{file.title}
								<Download class="h-4 w-4" aria-hidden="true" />
							</a>
						{/each}
					</div>
				</div>
			{/if}

			{#if storeOrder.shipping}
				<div class="mt-6 border-t border-black/10 pt-6">
					<p
						class="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#17200f]/50"
					>
						<Package class="h-3.5 w-3.5" aria-hidden="true" />
						Shipping to
					</p>
					<p class="text-sm leading-relaxed text-[#17200f]/70">
						{storeOrder.shipping.address}<br />
						{storeOrder.shipping.city}, {storeOrder.shipping.postcode}<br />
						{storeOrder.shipping.country}
					</p>
				</div>
			{/if}

			<div class="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
				<span class="font-bold text-[#17200f]">Total paid</span>
				<span class="text-xl font-bold text-[#5C9B19]">
					<Price amountGBP={storeOrder.subtotal} {currency} {rate} size="md" />
				</span>
			</div>
		</div>
	{:else if booking}
		<!-- TOUR BOOKING (your existing view, unchanged) -->
		<div class="rounded-[28px] border border-black/10 bg-white p-8">
			<div class="flex items-center justify-between">
				<AccountHeader customer={data.customer} title="Booking details" />

				<span
					class="rounded-full bg-[#5C9B19]/10 px-3 py-1 text-xs font-bold capitalize text-[#5C9B19]"
				>
					{booking.paymentStatus}
				</span>
			</div>

			<div class="mt-6 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
				{#if booking.startDate}
					<div class="flex items-center gap-2 text-sm text-[#17200f]/70">
						<Calendar class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
						{formatDate(booking.startDate)} → {formatDate(booking.endDate)}
					</div>
				{/if}
				<div class="flex items-center gap-2 text-sm text-[#17200f]/70">
					<Users class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
					{booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}
				</div>
				<div class="flex items-center gap-2 text-sm text-[#17200f]/70">
					<CreditCard class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
					Paid via {booking.paymentMethod}
				</div>
			</div>

			<div class="mt-6 border-t border-black/10 pt-6">
				<p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">
					What you booked
				</p>

				{#if booking.tours?.length}
					<div class="flex flex-col gap-2">
						{#each booking.tours as tour (tour.id)}
							<div
								class="flex items-center justify-between rounded-2xl bg-[#f7f3ea] px-4 py-3 text-sm"
							>
								<span class="font-medium text-[#17200f]">{tour.title}</span>
								<span class="text-[#17200f]/60">
									<Price amountGBP={tour.price} {currency} {rate} size="sm" /> × {tour.travelers}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<div class="rounded-2xl bg-[#f7f3ea] px-4 py-4">
						<div class="flex items-center gap-2 text-sm text-[#17200f]">
							<MapPin class="h-4 w-4 text-[#5C9B19]" aria-hidden="true" />
							<span class="font-semibold"
								>{booking.destination || 'Destination not specified'}</span
							>
						</div>
						{#if booking.tripType}
							<p class="mt-1 text-xs capitalize text-[#17200f]/60">{booking.tripType} trip</p>
						{/if}
					</div>
				{/if}
			</div>

			{#if booking.addOns?.length}
				<div class="mt-6 border-t border-black/10 pt-6">
					<p
						class="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#17200f]/50"
					>
						<Sparkles class="h-3.5 w-3.5" aria-hidden="true" />
						Add-ons requested
					</p>
					<div class="flex flex-wrap gap-2">
						{#each booking.addOns as addOnId (addOnId)}
							<span
								class="rounded-full bg-[#5C9B19]/10 px-3 py-1 text-xs font-semibold text-[#5C9B19]"
							>
								{addOnLabels[addOnId] ?? addOnId}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if booking.customAddOn || booking.customAddOnText || booking.notes}
				<div class="mt-6 border-t border-black/10 pt-6">
					<p class="mb-2 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Notes</p>
					<p class="text-sm text-[#17200f]/70">
						{booking.customAddOn || booking.customAddOnText || booking.notes}
					</p>
				</div>
			{/if}

			<div class="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
				<span class="font-bold text-[#17200f]">Total paid</span>
				<span class="text-xl font-bold text-[#5C9B19]">
					<Price amountGBP={booking.amountGBP} {currency} {rate} size="md" />
				</span>
			</div>
		</div>
	{/if}
</section>