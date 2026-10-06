<script lang="ts">
	import { Calendar, MapPin, ArrowUpRight } from 'lucide-svelte';
	import AccountHeader from '../../../components/AccountHeader.svelte';
	import Price from '../../../components/Price.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const bookings = $derived(data.bookings ?? []);
	const currency = $derived(data.currency);
	const rate = $derived(data.rate);

	function statusColor(status: string) {
		if (status === 'paid') return 'bg-[#5C9B19]/10 text-[#5C9B19]';
		if (status === 'failed') return 'bg-red-50 text-red-500';
		return 'bg-[#F98315]/10 text-[#F98315]'; // pending
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function cardTitle(booking: any) {
		if (booking.kind === 'store') {
			return (booking.items ?? [])
				.map((i: any) => `${i.title}${i.quantity > 1 ? ` ×${i.quantity}` : ''}`)
				.join(', ');
		}
		return booking.tours?.length
			? booking.tours.map((t: any) => t.title).join(', ')
			: booking.destination || 'Custom trip';
	}
</script>

<section class="mx-auto max-w-4xl px-5 py-24">
	<AccountHeader
		customer={data.customer}
		title="My Bookings"
		subtitle="Everything you've booked or bought with us, in one place."
	/>

	{#if bookings.length === 0}
		<div class="mt-10 rounded-3xl border border-black/10 bg-white p-10 text-center">
			<p class="text-sm text-[#17200f]/60">You haven't booked or ordered anything yet.</p>
			<div class="mt-4 flex items-center justify-center gap-3">
				<a
					href="/tours"
					class="inline-flex rounded-full bg-[#5C9B19] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4c8316]"
				>
					Browse tours
				</a>
				<a
					href="/store"
					class="inline-flex rounded-full border border-black/10 px-5 py-2.5 text-sm font-bold text-[#17200f] transition hover:border-black/20"
				>
					Visit store
				</a>
			</div>
		</div>
	{:else}
		<div class="mt-8 flex flex-col gap-4">
			{#each bookings as booking (booking._id)}
				<a
					href={`/account/bookings/${booking._id}`}
					class="flex flex-col gap-3 rounded-[22px] border border-black/10 bg-white p-5 transition hover:border-[#5C9B19]/40 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
				>
					<div class="min-w-0 flex-1">
						<div class="flex flex-wrap items-center gap-2">
							<span class="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-bold text-[#17200f]/60">
								{booking.kind === 'store' ? 'Store' : 'Tour'}
							</span>
							<p class="font-semibold text-[#17200f]">{cardTitle(booking)}</p>
							<span
								class="rounded-full px-2.5 py-0.5 text-xs font-bold capitalize {statusColor(
									booking.paymentStatus
								)}"
							>
								{booking.paymentStatus}
							</span>
						</div>
						<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#17200f]/50">
							{#if booking.kind === 'tour' && booking.destination}
								<span class="flex items-center gap-1"
									><MapPin class="h-3.5 w-3.5" aria-hidden="true" />{booking.destination}</span
								>
							{/if}
							{#if booking.kind === 'tour' && booking.startDate}
								<span class="flex items-center gap-1"
									><Calendar class="h-3.5 w-3.5" aria-hidden="true" />{formatDate(
										booking.startDate
									)}</span
								>
							{/if}
							<span>{booking.kind === 'store' ? 'Ordered' : 'Booked'} {formatDate(booking.createdAt)}</span>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<Price amountGBP={booking.amountGBP} {currency} {rate} size="md" />
						<ArrowUpRight class="h-4 w-4 text-[#17200f]/30" aria-hidden="true" />
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>