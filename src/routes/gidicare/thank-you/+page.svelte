<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onMount } from 'svelte';
	import { CheckCircle2, Clock, Heart, TriangleAlert } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const donation = $derived(data.donation);
	const status = $derived(donation.paymentStatus);

	const isPaid = $derived(status === 'paid');
	const isPending = $derived(status === 'pending');

	let attempts = $state(0);

	// The payment provider confirms the donation to our server in the background.
	// This page checks every few seconds for up to 30 seconds.
	onMount(() => {
		const timer = setInterval(async () => {
			if (!isPending || attempts >= 10) {
				clearInterval(timer);
				return;
			}
			attempts += 1;
			await invalidateAll();
		}, 3000);

		return () => clearInterval(timer);
	});

	const amountText = $derived.by(() => {
		try {
			if (donation.amountCharged && donation.currency) {
				const code = String(donation.currency).toUpperCase();
				return new Intl.NumberFormat('en-GB', {
					style: 'currency',
					currency: code,
					maximumFractionDigits: code === 'GBP' ? 2 : 0
				}).format(donation.amountCharged / 100);
			}
		} catch {
			// fall through to pounds
		}
		return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(
			donation.amountGBP
		);
	});

	const shareText = 'I just donated to GidiCare to help stray and injured animals. You can help too:';
	const shareUrl = 'https://giditour.com/gidicare';
</script>

<svelte:head>
	<title>Thank you | GidiCare</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="bg-[#f7f3ea] px-5 py-20 sm:px-8">
	<div class="mx-auto max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm sm:p-12">
		{#if isPaid}
			<CheckCircle2 class="mx-auto h-14 w-14 text-[#5C9B19]" aria-hidden="true" />
			<h1 class="mt-5 text-3xl font-bold text-[#17200f]">
				Thank you{donation.firstName ? `, ${donation.firstName}` : ''}
			</h1>
			<p class="mt-3 text-[#17200f]/70">
				Your donation of <strong class="text-[#17200f]">{amountText}</strong>
				{donation.caseTitle ? `to help ${donation.caseTitle}` : 'to GidiCare'} has been received. We have emailed you a receipt.
			</p>
			<p class="mt-2 flex items-center justify-center gap-1.5 text-sm text-[#17200f]/55">
				<Heart class="h-4 w-4 fill-[#F98315] text-[#F98315]" aria-hidden="true" />
				Because of you, an animal gets the care it needs.
			</p>

			<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
				<a
					href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
					target="_blank"
					rel="noopener noreferrer"
					class="rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
				>
					Share on WhatsApp
				</a>
				<a
					href="/gidicare"
					class="rounded-full border border-black/15 px-6 py-3 text-sm font-bold text-[#17200f] transition hover:border-black/30"
				>
					Back to GidiCare
				</a>
			</div>
		{:else if isPending}
			<Clock class="mx-auto h-14 w-14 text-[#F98315]" aria-hidden="true" />
			<h1 class="mt-5 text-3xl font-bold text-[#17200f]">Confirming your donation…</h1>
			<p class="mt-3 text-[#17200f]/70">
				This usually takes a few seconds. You can keep this page open. We will also email you as
				soon as it is confirmed.
			</p>
			{#if attempts >= 10}
				<p class="mt-4 text-sm text-[#17200f]/60">
					It is taking longer than usual. If you completed the payment, you do not need to do
					anything. We will email you when it is confirmed. If you were not charged, you can
					<a href="/gidicare" class="font-semibold underline">try again</a>.
				</p>
			{/if}
		{:else if status === 'review'}
			<Clock class="mx-auto h-14 w-14 text-[#F98315]" aria-hidden="true" />
			<h1 class="mt-5 text-3xl font-bold text-[#17200f]">We are checking your payment</h1>
			<p class="mt-3 text-[#17200f]/70">
				Something about this payment needs a quick check by our team. We will email you shortly.
				Please keep your reference: <strong>{data.donationId}</strong>.
			</p>
		{:else}
			<TriangleAlert class="mx-auto h-14 w-14 text-red-500" aria-hidden="true" />
			<h1 class="mt-5 text-3xl font-bold text-[#17200f]">The donation was not completed</h1>
			<p class="mt-3 text-[#17200f]/70">
				Your payment did not go through, so you have not been charged for this donation. You are
				welcome to try again.
			</p>
			<a
				href={donation.caseSlug ? `/gidicare/${donation.caseSlug}` : '/gidicare'}
				class="mt-8 inline-block rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
			>
				Try again
			</a>
		{/if}
	</div>
</section>
