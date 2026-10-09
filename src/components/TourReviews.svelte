<script lang="ts">
	import { enhance } from '$app/forms';
	import { Star } from 'lucide-svelte';

	interface Review {
		_id: string;
		name: string;
		rating: number;
		title?: string;
		comment: string;
		createdAt: string;
	}

	let { reviews, form }: { reviews: Review[]; form: any } = $props();

	let rating = $state(form?.rating ?? 0);
	let hover = $state(0);
	let submitting = $state(false);

	const average = $derived(
		reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0
	);

	const fmt = (d: string) =>
		new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
</script>

<div class="mt-16" id="reviews">
	<div class="flex flex-wrap items-end justify-between gap-3">
		<h2 class="font-bold text-3xl tracking-[-.02em] text-[#17200f] sm:text-4xl">
			Traveler reviews
		</h2>
		{#if reviews.length}
			<span class="flex items-center gap-1.5 text-base font-bold text-[#17200f]">
				<Star class="h-5 w-5 fill-[#F98315] text-[#F98315]" aria-hidden="true" />
				{average.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? 's' : ''}
			</span>
		{/if}
	</div>

	<!-- List -->
	<div class="mt-6 flex flex-col gap-4">
		{#each reviews as r (r._id)}
			<article class="rounded-2xl bg-white p-5 shadow-sm">
				<div class="flex items-center justify-between gap-3">
					<p class="font-bold text-[#17200f]">{r.name}</p>
					<span class="text-sm text-[#17200f]/60">{fmt(r.createdAt)}</span>
				</div>
				<div class="mt-1 flex" aria-label={`${r.rating} out of 5 stars`}>
					{#each [1, 2, 3, 4, 5] as n}
						<Star
							class={`h-4 w-4 ${n <= r.rating ? 'fill-[#F98315] text-[#F98315]' : 'text-black/20'}`}
							aria-hidden="true"
						/>
					{/each}
				</div>
				{#if r.title}<p class="mt-3 font-bold text-[#17200f]">{r.title}</p>{/if}
				<p class="mt-1 text-base leading-relaxed text-[#17200f]/75">{r.comment}</p>
			</article>
		{:else}
			<p class="text-base text-[#17200f]/60">
				No reviews yet. Be the first to share your experience!
			</p>
		{/each}
	</div>

	<!-- Form -->
	<div class="mt-10 rounded-[28px] border border-black/10 bg-white p-6">
		<h3 class="font-bold text-xl text-[#17200f]">Write a review</h3>

		{#if form?.success}
			<p class="mt-4 rounded-2xl bg-[#5C9B19]/10 p-4 text-base text-[#17200f]/80">
				Thank you! Your review has been submitted and will appear once approved.
			</p>
		{:else}
			<form
				method="POST"
				action="?/submitReview"
				class="mt-4 flex flex-col gap-4"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<div>
					<span class="text-sm font-medium text-[#17200f]/70">Your rating</span>
					<div
						class="mt-1 flex gap-1"
						onmouseleave={() => (hover = 0)}
						role="radiogroup"
						tabindex="-1"
					>
						{#each [1, 2, 3, 4, 5] as n}
							<button
								type="button"
								role="radio"
								aria-checked={rating === n}
								aria-label={`${n} star${n > 1 ? 's' : ''}`}
								onmouseenter={() => (hover = n)}
								onclick={() => (rating = n)}
							>
								<Star
									class={`h-7 w-7 transition ${n <= (hover || rating) ? 'fill-[#F98315] text-[#F98315]' : 'text-black/20'}`}
									aria-hidden="true"
								/>
							</button>
						{/each}
					</div>
					<input type="hidden" name="rating" value={rating} />
				</div>

				<input
					name="name"
					placeholder="Your name"
					value={form?.name ?? ''}
					required
					maxlength="60"
					class="rounded-2xl border border-black/10 px-4 py-3 text-base"
				/>
				<input
					name="location"
					placeholder="Where are you from? (e.g. London, UK)"
					value={form?.location ?? ''}
					maxlength="60"
					class="rounded-2xl border border-black/10 px-4 py-3 text-base"
				/>
				<input
					name="title"
					placeholder="Review title (optional)"
					value={form?.title ?? ''}
					maxlength="100"
					class="rounded-2xl border border-black/10 px-4 py-3 text-base"
				/>
				<textarea
					name="comment"
					rows="4"
					placeholder="Tell others about your trip…"
					required
					minlength="10"
					maxlength="1500"
					class="rounded-2xl border border-black/10 px-4 py-3 text-base"
					>{form?.comment ?? ''}</textarea
				>

				<!-- honeypot -->
				<input name="website" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />

				{#if form?.error}<p class="text-sm font-bold text-red-600">{form.error}</p>{/if}

				<button
					type="submit"
					disabled={submitting}
					class="w-fit rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-[1.02] disabled:opacity-60"
				>
					{submitting ? 'Submitting…' : 'Submit review'}
				</button>
			</form>
		{/if}
	</div>
</div>
