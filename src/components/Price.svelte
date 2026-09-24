<script lang="ts">
	import type { CurrencyInfo } from '$lib/currency/countryCurrency';

	interface Props {
		amountGBP: number;
		currency: CurrencyInfo;
		rate: number | null;
		suffix?: string;
		size?: 'sm' | 'md' | 'lg';
	}

	let { amountGBP, currency, rate, suffix = '', size = 'md' }: Props = $props();

	const convertedAmount = $derived(rate !== null ? Math.round(amountGBP * rate) : null);

	const primarySizeClass = $derived(
		size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : size === 'md' ? 'text-lg' : 'text-2xl'
	);

	const isConvertedCurrency = $derived(currency.code !== 'GBP' && convertedAmount !== null);
</script>

{#if isConvertedCurrency}
		<span class={`${primarySizeClass} font-bold`}>
			{currency.symbol}{convertedAmount.toLocaleString()}{suffix}
		</span>
{:else}
	<span class={`${primarySizeClass} font-bold text-[#17200f]`}>
		£{amountGBP.toLocaleString()}{suffix}
	</span>
{/if}
