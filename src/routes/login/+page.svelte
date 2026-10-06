<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { Eye, EyeOff } from 'lucide-svelte';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let showPassword = $state(false);

	async function handleLogin() {
		error = '';
		loading = true;
		const res = await signIn('credentials', { email, password, redirect: false });
		loading = false;

		if (res?.error) {
			error = 'Invalid email or password.';
		} else {
			window.location.href = '/book';
		}
	}
</script>

<section class="mx-auto max-w-md px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Log in</h1>
	<p class="mt-2 text-sm text-[#17200f]/60">You'll need an account to book a tour.</p>

	<button
		type="button"
		onclick={() => signIn('google', { callbackUrl: '/book' })}
		class="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#17200f] transition hover:border-black/20"
	>
		Continue with Google
	</button>

	<div class="my-6 flex items-center gap-3 text-xs text-[#17200f]/40">
		<div class="h-px flex-1 bg-black/10"></div>
		or
		<div class="h-px flex-1 bg-black/10"></div>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleLogin();
		}}
		class="flex flex-col gap-3"
	>
		<input
			type="email"
			bind:value={email}
			placeholder="Email"
			required
			class="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
		/>
		<div class="relative flex">
			<input
				type={showPassword ? 'text' : 'password'}
				bind:value={password}
				placeholder="Password"
				required
				class="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19] w-full"
			/>
			<button
				type="button"
				onclick={() => (showPassword = !showPassword)}
				aria-label={showPassword ? 'Hide password' : 'Show password'}
				class="absolute right-3 top-1/2 -translate-y-1/2 text-[#17200f]/40 transition hover:text-[#17200f]"
			>
				{#if showPassword}<EyeOff class="h-4 w-4" aria-hidden="true" />{:else}<Eye
						class="h-4 w-4"
						aria-hidden="true"
					/>{/if}
			</button>
		</div>
		{#if error}
			<p class="text-sm text-red-500">{error}</p>
		{/if}
		<a
			href="/forgot-password"
			class="self-end text-sm font-semibold text-[#5C9B19] hover:underline"
		>
			Forgot password?
		</a>
		<button
			type="submit"
			disabled={loading}
			class="mt-2 rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-50"
		>
			{loading ? 'Logging in…' : 'Log in'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-[#17200f]/60">
		Don't have an account? <a href="/signup" class="font-semibold text-[#5C9B19]">Sign up</a>
	</p>
</section>
