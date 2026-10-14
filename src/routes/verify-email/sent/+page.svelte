<script lang="ts">
	import { page } from '$app/state';

	const email = $derived(page.url.searchParams.get('email') ?? '');
</script>

<section class="mx-auto max-w-md px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Check your email</h1>
	<p class="mt-3 text-sm text-[#17200f]/70">
		We sent a confirmation link{email ? ' to' : ''}
		{#if email}<strong>{email}</strong>{/if}. Open it to finish creating your account, then log in.
	</p>
	<p class="mt-3 text-sm text-[#17200f]/60">
		Can't find it? Check your spam folder. You can also try to log in and we'll offer to send a new link.
	</p>
	<a
		href="/login"
		class="mt-8 inline-block rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
	>
		Go to log in
	</a>
</section>
