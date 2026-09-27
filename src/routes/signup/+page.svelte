<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { Eye, EyeOff } from 'lucide-svelte';
	import { countryDialCodes } from '$lib/data/countryDialCodes';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let nationality = $state('');
	let phoneDialCode = $state('');
	let phoneNumber = $state('');

	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let loading = $state(false);

	function onNationalityChange() {
		const match = countryDialCodes.find((c) => c.name === nationality);
		if (match) phoneDialCode = match.dialCode;
	}

	const passwordsMatch = $derived(confirmPassword.length === 0 || password === confirmPassword);

	function validateClientSide(): Record<string, string> {
		const errs: Record<string, string> = {};
		if (!name.trim() || name.trim().length < 2) errs.name = 'Please enter your full name.';
		if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			errs.email = 'Please enter a valid email address.';
		if (!password || password.length < 8) errs.password = 'Password must be at least 8 characters.';
		if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
		if (!nationality) errs.nationality = 'Please select your nationality.';
		if (!phoneNumber.trim() || phoneNumber.trim().length < 6)
			errs.phoneNumber = 'Please enter a valid phone number.';
		return errs;
	}

	async function handleSignup() {
		formError = '';

		const clientErrors = validateClientSide();
		if (Object.keys(clientErrors).length > 0) {
			fieldErrors = clientErrors;
			return;
		}
		fieldErrors = {};

		loading = true;

		try {
			const res = await fetch('/api/auth/signup', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, password, nationality, phoneDialCode, phoneNumber })
			});
			const data = await res.json();

			if (!res.ok) {
				fieldErrors = data.fieldErrors ?? {};
				formError = data.error ?? 'Something went wrong.';
				loading = false;
				return;
			}

			await signIn('credentials', { email, password, redirect: false });
			loading = false;
			window.location.href = '/book';
		} catch {
			formError = 'Network error. Please try again.';
			loading = false;
		}
	}
</script>

<section class="mx-auto max-w-md px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Create an account</h1>
	<p class="mt-2 text-sm text-[#17200f]/60">
		Save your details for faster bookings and track your trips.
	</p>

	<button
		type="button"
		onclick={() => signIn('google', { callbackUrl: '/book' })}
		class="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-3 text-sm font-semibold text-[#17200f] transition hover:border-black/20"
	>
		Continue with Google
	</button>

	<div class="my-6 flex items-center gap-3 text-xs text-[#17200f]/40">
		<div class="h-px flex-1 bg-black/10"></div>
		or sign up with email
		<div class="h-px flex-1 bg-black/10"></div>
	</div>

	<form
		onsubmit={(e) => {
			e.preventDefault();
			handleSignup();
		}}
		class="flex flex-col gap-4"
	>
		<div class="flex flex-col gap-1.5">
			<label for="signup-name" class="text-xs font-medium text-[#17200f]/60">Full name</label>
			<input
				id="signup-name"
				type="text"
				bind:value={name}
				placeholder="Adaeze Okafor"
				class="rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#5C9B19] {fieldErrors.name
					? 'border-red-400'
					: 'border-black/10'}"
			/>
			{#if fieldErrors.name}<p class="text-xs text-red-500">{fieldErrors.name}</p>{/if}
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="signup-email" class="text-xs font-medium text-[#17200f]/60">Email</label>
			<input
				id="signup-email"
				type="email"
				bind:value={email}
				placeholder="you@example.com"
				class="rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#5C9B19] {fieldErrors.email
					? 'border-red-400'
					: 'border-black/10'}"
			/>
			{#if fieldErrors.email}<p class="text-xs text-red-500">{fieldErrors.email}</p>{/if}
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="signup-nationality" class="text-xs font-medium text-[#17200f]/60"
				>Nationality</label
			>
			<select
				id="signup-nationality"
				bind:value={nationality}
				onchange={onNationalityChange}
				class="rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-[#5C9B19] {fieldErrors.nationality
					? 'border-red-400'
					: 'border-black/10'}"
			>
				<option value="" disabled selected>Select your nationality</option>
				{#each countryDialCodes as country (country.code)}
					<option value={country.name}>{country.name}</option>
				{/each}
			</select>
			{#if fieldErrors.nationality}<p class="text-xs text-red-500">
					{fieldErrors.nationality}
				</p>{/if}
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="signup-phone" class="text-xs font-medium text-[#17200f]/60">Phone number</label>
			<div class="flex gap-2">
				<div
					class="flex w-24 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-[#f7f3ea] px-2 text-sm font-semibold text-[#17200f]/70"
				>
					{phoneDialCode || '+--'}
				</div>
				<input
					id="signup-phone"
					type="tel"
					bind:value={phoneNumber}
					placeholder="800 000 0000"
					class="flex-1 rounded-2xl border px-4 py-3 text-sm outline-none focus:border-[#5C9B19] {fieldErrors.phoneNumber
						? 'border-red-400'
						: 'border-black/10'}"
				/>
			</div>
			{#if fieldErrors.phoneNumber}<p class="text-xs text-red-500">
					{fieldErrors.phoneNumber}
				</p>{/if}
			<p class="text-xs text-[#17200f]/40">
				Dial code fills in automatically once you pick your nationality.
			</p>
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="signup-password" class="text-xs font-medium text-[#17200f]/60"
				>Create password</label
			>
			<div class="relative">
				<input
					id="signup-password"
					type={showPassword ? 'text' : 'password'}
					bind:value={password}
					placeholder="At least 8 characters"
					class="w-full rounded-2xl border px-4 py-3 pr-11 text-sm outline-none focus:border-[#5C9B19] {fieldErrors.password
						? 'border-red-400'
						: 'border-black/10'}"
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
			{#if fieldErrors.password}<p class="text-xs text-red-500">{fieldErrors.password}</p>{/if}
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="signup-confirm-password" class="text-xs font-medium text-[#17200f]/60"
				>Confirm password</label
			>
			<div class="relative">
				<input
					id="signup-confirm-password"
					type={showConfirmPassword ? 'text' : 'password'}
					bind:value={confirmPassword}
					placeholder="Re-enter your password"
					class="w-full rounded-2xl border px-4 py-3 pr-11 text-sm outline-none focus:border-[#5C9B19] {fieldErrors.confirmPassword ||
					!passwordsMatch
						? 'border-red-400'
						: 'border-black/10'}"
				/>
				<button
					type="button"
					onclick={() => (showConfirmPassword = !showConfirmPassword)}
					aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-[#17200f]/40 transition hover:text-[#17200f]"
				>
					{#if showConfirmPassword}<EyeOff class="h-4 w-4" aria-hidden="true" />{:else}<Eye
							class="h-4 w-4"
							aria-hidden="true"
						/>{/if}
				</button>
			</div>
			{#if !passwordsMatch}
				<p class="text-xs text-red-500">Passwords do not match.</p>
			{:else if fieldErrors.confirmPassword}
				<p class="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
			{/if}
		</div>

		{#if formError}
			<p class="text-sm text-red-500" role="alert">{formError}</p>
		{/if}

		<button
			type="submit"
			disabled={loading}
			class="mt-2 rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-50"
		>
			{loading ? 'Creating account…' : 'Sign up'}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-[#17200f]/60">
		Already have an account? <a href="/login" class="font-semibold text-[#5C9B19]">Log in</a>
	</p>
</section>
