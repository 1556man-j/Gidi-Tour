<script lang="ts">
	import { tourStore, type TourListItem } from '$lib/stores/tourStore.svelte';
	import { X, Trash2, ArrowRight } from 'lucide-svelte';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === 'Escape' && tourStore.sidebarOpen) tourStore.closeSidebar();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if tourStore.sidebarOpen}
	<div
		class="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
		onclick={() => tourStore.closeSidebar()}
		role="presentation"
	></div>

	<aside
		class="fixed right-0 top-0 z-101 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
		transition:fly={{ x: 400, duration: 300, easing: cubicOut }}
	>
		<!-- HEADER -->
		<div class="flex items-center justify-between border-b border-black/10 px-6 py-5">
			<div>
				<p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f98315]">
					Gidi Tour
				</p>
				<h2 class="mt-1 text-xl font-bold text-[#17200f]">
					Your Tour List {tourStore.count > 0 ? `(${tourStore.count})` : ''}
				</h2>
			</div>
			<button
				type="button"
				aria-label="Close"
				onclick={() => tourStore.closeSidebar()}
				class="flex h-9 w-9 items-center justify-center rounded-full text-[#17200f]/60 transition hover:bg-black/5 hover:text-[#17200f]"
			>
				<X class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		<!-- ITEMS -->
		<div class="flex-1 overflow-y-auto px-6 py-4">
			{#if tourStore.count === 0}
				<div class="flex h-full flex-col items-center justify-center text-center">
					<p class="text-base font-semibold text-[#17200f]/70">Your tour list is empty</p>
					<p class="mt-1 text-sm text-[#17200f]/50">
						Tap "Add to Tour List" on any tour to save it here.
					</p>
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					{#each tourStore.items as item (item.id)}
						<div class="flex gap-3 rounded-2xl border border-black/10 p-3">
							<img
								src={item.image}
								alt={item.title}
								class="h-20 w-20 shrink-0 rounded-xl object-cover"
							/>
							<div class="flex flex-1 flex-col justify-between gap-2">
								<div class="flex items-start justify-between gap-2">
									<a
										href={`/tours/${item.slug}`}
										onclick={() => tourStore.closeSidebar()}
										class="text-sm font-bold leading-snug text-[#17200f] hover:underline"
									>
										{item.title}
									</a>
									<button
										type="button"
										aria-label={`Remove ${item.title}`}
										onclick={() => tourStore.remove(item.id)}
										class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#17200f]/40 transition hover:bg-red-50 hover:text-red-500"
									>
										<Trash2 class="h-4 w-4" aria-hidden="true" />
									</button>
								</div>

								<div class="flex items-center justify-between">
									<!-- TRAVELERS STEPPER -->
									<div class="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1">
										<button
											type="button"
											aria-label="Decrease travelers"
											onclick={() => tourStore.updateTravelers(item.id, item.travelers - 1)}
											class="flex h-5 w-5 items-center justify-center rounded-full bg-black/5 text-xs font-bold text-[#17200f] transition hover:bg-black/10"
										>
											−
										</button>
										<span class="w-4 text-center text-xs font-bold text-[#17200f]">
											{item.travelers}
										</span>
										<button
											type="button"
											aria-label="Increase travelers"
											onclick={() => tourStore.updateTravelers(item.id, item.travelers + 1)}
											class="flex h-5 w-5 items-center justify-center rounded-full bg-black/5 text-xs font-bold text-[#17200f] transition hover:bg-black/10"
										>
											+
										</button>
									</div>

									<span class="text-sm font-bold text-[#5C9B19]">
										£{item.price * item.travelers}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- FOOTER -->
		{#if tourStore.count > 0}
			<div class="border-t border-black/10 px-6 py-5">
				<div class="mb-1 flex items-center justify-between">
					<span class="text-sm font-medium text-[#17200f]/70">Deposit due today</span>
					<span class="text-sm font-medium text-[#5C9B19]">£{tourStore.totalDeposit}</span>
				</div>
				<div class="mb-4 flex items-center justify-between">
					<span class="text-sm font-medium text-[#17200f]/70">Estimated total</span>
					<span class="text-lg font-bold text-[#17200f]">£{tourStore.totalPrice}</span>
				</div>

				<a
					href="/book"
					onclick={() => tourStore.closeSidebar()}
					class="flex w-full items-center justify-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:scale-[1.02]"
				>
					Proceed to booking
					<ArrowRight class="h-4 w-4" aria-hidden="true" />
				</a>
				<button
					type="button"
					onclick={() => tourStore.clear()}
					class="mt-2 flex w-full items-center justify-center text-xs font-semibold text-[#17200f]/40 transition hover:text-red-500"
				>
					Clear list
				</button>
			</div>
		{/if}
	</aside>
{/if}