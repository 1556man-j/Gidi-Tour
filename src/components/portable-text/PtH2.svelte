<script lang="ts">
	let { children } = $props();
</script>
<h2 class="mt-10 mb-4 text-2xl font-bold tracking-[-.02em] text-[#17200f] sm:text-3xl">
	{@render children()}
</h2>