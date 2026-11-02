<script lang="ts">
	interface Props {
		raisedGBP: number;
		goalGBP?: number;
	}

	let { raisedGBP, goalGBP }: Props = $props();

	const gbp = new Intl.NumberFormat('en-GB', {
		style: 'currency',
		currency: 'GBP',
		maximumFractionDigits: 0
	});

	const percent = $derived(
		goalGBP && goalGBP > 0 ? Math.min(100, Math.round((raisedGBP / goalGBP) * 100)) : 0
	);
</script>

{#if goalGBP && goalGBP > 0}
	<div>
		<div
			class="h-2.5 w-full overflow-hidden rounded-full bg-black/10"
			role="progressbar"
			aria-valuenow={percent}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label="Funding progress"
		>
			<div class="h-full rounded-full bg-[#5C9B19] transition-all" style="width: {percent}%"></div>
		</div>
		<p class="mt-2 text-sm text-[#17200f]/70">
			<strong class="text-[#17200f]">{gbp.format(raisedGBP)}</strong> raised of {gbp.format(goalGBP)}
			<span class="text-[#17200f]/50">({percent}%)</span>
		</p>
	</div>
{:else if raisedGBP > 0}
	<p class="text-sm text-[#17200f]/70">
		<strong class="text-[#17200f]">{gbp.format(raisedGBP)}</strong> raised so far
	</p>
{/if}
