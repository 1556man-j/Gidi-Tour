<script lang="ts">
	interface Props {
		customer: { name?: string; email?: string; avatarUrl?: string | null } | null | undefined;
		title: string;
		subtitle?: string;
	}

	let { customer, title, subtitle }: Props = $props();

	const displayName = $derived(customer?.name ?? customer?.email ?? 'Your account');
	const initialLetter = $derived(displayName.charAt(0).toUpperCase());
</script>

<div class="mb-8 flex items-center gap-4">
	{#if customer?.avatarUrl}
		<img src={customer.avatarUrl} alt="" class="h-14 w-14 shrink-0 rounded-full object-cover" />
	{:else}
		<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#5C9B19]/10 text-lg font-bold text-[#5C9B19]">
			{initialLetter}
		</div>
	{/if}
	<div>
		<p class="text-xs font-medium text-[#17200f]/50">{displayName}</p>
		<h1 class="text-2xl font-bold text-[#17200f] sm:text-3xl">{title}</h1>
		{#if subtitle}<p class="text-sm text-[#17200f]/60">{subtitle}</p>{/if}
	</div>
</div>