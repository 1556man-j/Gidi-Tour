<script lang="ts">
	import type { CurrencyInfo } from '$lib/currency/countryCurrency';

	interface Props {
		amountGBP: number;
		currency: CurrencyInfo;
		rate: number | null;
		suffix?: string; // e.g. "/person"
		size?: 'sm' | 'md' | 'lg';
	}

	let { amountGBP, currency, rate, suffix = '', size = 'md' }: Props = $props();

	const convertedAmount = $derived(rate !== null ? Math.round(amountGBP * rate) : null);

	const primarySizeClass = $derived(
		size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-2xl'
	);
</script>

{#if convertedAmount !== null && currency.code !== 'GBP'}
	<span class="inline-flex flex-col">
		<span class="{primarySizeClass} font-bold text-[#17200f]">
			{currency.symbol}{convertedAmount.toLocaleString()}{suffix}
		</span>
		<span class="text-xs text-[#17200f]/45">approx. £{amountGBP}{suffix} GBP</span>
	</span>
{:else}
	<span class="{primarySizeClass} font-bold text-[#17200f]">
		£{amountGBP.toLocaleString()}{suffix}
	</span>
{/if}