<script lang="ts">
	let { data, form } = $props();
</script>

<section class="mx-auto max-w-md px-5 py-24">
	{#if form?.verified}
		<h1 class="text-3xl font-bold text-[#17200f]">Email confirmed</h1>
		<p class="mt-3 text-sm text-[#17200f]/70">Thank you. Your account is ready.</p>
		<a
			href="/login"
			class="mt-8 inline-block rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
		>
			Log in
		</a>
	{:else if data.valid && !form}
		<h1 class="text-3xl font-bold text-[#17200f]">Confirm your email</h1>
		<p class="mt-3 text-sm text-[#17200f]/70">Press the button to finish setting up your account.</p>
		<form method="POST" action="?/confirm" class="mt-8">
			<input type="hidden" name="token" value={data.token} />
			<button
				type="submit"
				class="rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
			>
				Confirm my email
			</button>
		</form>
	{:else}
		<h1 class="text-3xl font-bold text-[#17200f]">This link has expired</h1>
		<p class="mt-3 text-sm text-[#17200f]/70">
			The confirmation link is invalid or has expired, or your email is already confirmed. Log in and
			we'll offer to send you a new one.
		</p>
		<a
			href="/login"
			class="mt-8 inline-block rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
		>
			Go to log in
		</a>
	{/if}
</section>
