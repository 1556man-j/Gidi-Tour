<script lang="ts">
	let email = $state('');
	let loading = $state(false);
	let message = $state('');
	let error = $state('');

	async function handleSubmit() {
		loading = true;
		error = '';
		message = '';

		try {
			const response = await fetch('/api/auth/forgot-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error ?? 'Something went wrong.';
				return;
			}

			message = data.message;
		} catch {
			error = 'Something went wrong. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<section class="mx-auto max-w-md px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Forgot password?</h1>

	<p class="mt-2 text-sm text-[#17200f]/60">
		Enter your email and we'll send you a link to reset your password.
	</p>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSubmit();
		}}
		class="mt-8 flex flex-col gap-3"
	>
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			required
			class="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
		/>

		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}

		{#if message}
			<p class="text-sm text-[#5C9B19]">{message}</p>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="mt-2 rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-50"
		>
			{loading ? 'Sending…' : 'Send reset link'}
		</button>
	</form>

	<a
		href="/login"
		class="mt-6 block text-center text-sm font-semibold text-[#5C9B19]"
	>
		Back to login
	</a>
</section>