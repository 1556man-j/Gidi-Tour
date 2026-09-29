<script lang="ts">
	import { Calendar, MapPin, ArrowUpRight } from 'lucide-svelte';
	import AccountHeader from '../../../components/AccountHeader.svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const bookings = $derived(data.bookings ?? []);

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
</script>

<section class="mx-auto max-w-4xl px-5 py-24">
	<AccountHeader
		customer={data.customer}
		title="My Bookings"
		subtitle="Everything you've booked with us, in one place."
	/>
	

	{#if bookings.length === 0}
		<div class="mt-10 rounded-3xl border border-black/10 bg-white p-10 text-center">
			<p class="text-sm text-[#17200f]/60">You haven't booked a trip yet.</p>
			<a
				href="/tours"
				class="mt-4 inline-flex rounded-full bg-[#5C9B19] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#4c8316]"
			>
				Browse tours
			</a>
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
							<p class="font-semibold text-[#17200f]">
								{booking.tours?.length
									? booking.tours.map((t: any) => t.title).join(', ')
									: booking.destination || 'Custom trip'}
							</p>
							<span
								class="rounded-full px-2.5 py-0.5 text-xs font-bold capitalize {statusColor(
									booking.paymentStatus
								)}"
							>
								{booking.paymentStatus}
							</span>
						</div>
						<div class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#17200f]/50">
							{#if booking.destination}
								<span class="flex items-center gap-1"
									><MapPin class="h-3.5 w-3.5" aria-hidden="true" />{booking.destination}</span
								>
							{/if}
							{#if booking.startDate}
								<span class="flex items-center gap-1"
									><Calendar class="h-3.5 w-3.5" aria-hidden="true" />{formatDate(
										booking.startDate
									)}</span
								>
							{/if}
							<span>Booked {formatDate(booking.createdAt)}</span>
						</div>
					</div>
					<div class="flex items-center gap-3">
						<p class="font-bold text-[#17200f]">£{booking.amountGBP}</p>
						<ArrowUpRight class="h-4 w-4 text-[#17200f]/30" aria-hidden="true" />
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
