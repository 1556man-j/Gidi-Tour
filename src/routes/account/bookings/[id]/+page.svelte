<script lang="ts">
	import { ArrowLeft, Calendar, Users, CreditCard } from 'lucide-svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const booking = $derived(data.booking);

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
	}
</script>

<section class="mx-auto max-w-2xl px-5 py-24">
	<a href="/account/bookings" class="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#17200f]/60 hover:text-[#17200f]">
		<ArrowLeft class="h-4 w-4" aria-hidden="true" />
		All bookings
	</a>

	<div class="rounded-[28px] border border-black/10 bg-white p-8">
		<div class="flex items-center justify-between">
			<h1 class="text-2xl font-bold text-[#17200f]">
				{booking.tours?.length ? booking.tours.map((t: any) => t.title).join(', ') : booking.destination || 'Custom trip'}
			</h1>
			<span class="rounded-full bg-[#5C9B19]/10 px-3 py-1 text-xs font-bold capitalize text-[#5C9B19]">
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

		{#if booking.tours?.length}
			<div class="mt-6 border-t border-black/10 pt-6">
				<p class="mb-3 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Tours</p>
				<div class="flex flex-col gap-2">
					{#each booking.tours as tour (tour.id)}
						<div class="flex items-center justify-between rounded-2xl bg-[#f7f3ea] px-4 py-3 text-sm">
							<span class="font-medium text-[#17200f]">{tour.title}</span>
							<span class="text-[#17200f]/60">£{tour.price} × {tour.travelers}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if booking.customAddOnText || booking.notes}
			<div class="mt-6 border-t border-black/10 pt-6">
				<p class="mb-2 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Notes</p>
				<p class="text-sm text-[#17200f]/70">{booking.customAddOnText || booking.notes}</p>
			</div>
		{/if}

		<div class="mt-6 flex items-center justify-between border-t border-black/10 pt-6">
			<span class="font-bold text-[#17200f]">Total paid</span>
			<span class="text-xl font-bold text-[#5C9B19]">£{booking.amountGBP}</span>
		</div>
	</div>
</section>