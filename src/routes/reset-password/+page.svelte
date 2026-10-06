<script lang="ts">
	let newPassword = $state('');
	let confirmPassword = $state('');
	let error = $state('');
	let success = $state('');
	let loading = $state(false);

	const token =
		typeof window !== 'undefined'
			? new URLSearchParams(window.location.search).get('token') ?? ''
			: '';

	async function resetPassword() {
		error = '';
		success = '';

		if (!token) {
			error = 'This password reset link is invalid or expired.';
			return;
		}

		if (!newPassword || !confirmPassword) {
			error = 'Please fill in both password fields.';
			return;
		}

		if (newPassword.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}

		if (newPassword !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		loading = true;

		try {
			const response = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					token,
					password: newPassword
				})
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'Could not reset your password.';
				return;
			}

			success = 'Your password has been reset successfully. Redirecting to login...';

			setTimeout(() => {
				window.location.href = '/login';
			}, 1500);
		} catch (err) {
			console.error(err);
			error = 'Something went wrong. Please try again.';
		} finally {
			loading = false;
		}
	}
</script>

<section class="mx-auto max-w-md px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Reset your password</h1>

	<p class="mt-2 text-sm text-[#17200f]/60">
		Enter a new password for your Gidi Tour account.
	</p>

	<form
		onsubmit={(event) => {
			event.preventDefault();
			resetPassword();
		}}
		class="mt-6 flex flex-col gap-4"
	>
		<input
			type="password"
			bind:value={newPassword}
			placeholder="New password"
			required
			minlength="8"
			class="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
		/>

		<input
			type="password"
			bind:value={confirmPassword}
			placeholder="Confirm new password"
			required
			minlength="8"
			class="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
		/>

		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}

		{#if success}
			<p class="text-sm text-[#5C9B19]">{success}</p>
		{/if}

		<button
			type="submit"
			disabled={loading || !token}
			class="mt-2 rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-50"
		>
			{loading ? 'Saving password…' : 'Reset password'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-[#17200f]/60">
		<a href="/login" class="font-semibold text-[#5C9B19]">Back to login</a>
	</p>
</section>