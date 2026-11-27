<script lang="ts">
	import { page } from '$app/state';
	import { signOut } from '@auth/sveltekit/client';

	const user = $derived(page.data.session?.user ?? null);

	let confirm = $state('');
	let password = $state('');
	let busy = $state(false);
	let error = $state('');
	let done = $state(false);

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		error = '';
		busy = true;
		try {
			const res = await fetch('/api/account/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ confirm, password })
			});
			const data = await res.json().catch(() => ({}));
			if (!res.ok) {
				error = data.error || 'Something went wrong. Please try again.';
			} else {
				done = true;
				await signOut({ redirect: false });
			}
		} catch {
			error = 'Could not reach the server. Check your connection and try again.';
		}
		busy = false;
	}

	const input = 'w-full rounded-2xl border border-[#17200f]/15 bg-white px-4 py-3.5 text-[15px] outline-none focus:border-[#5C9B19]';
</script>

<svelte:head>
	<title>Delete your account | Gidi Tour</title>
	<meta name="description" content="Request deletion of your Gidi Tour account and personal data." />
	<link rel="canonical" href="https://giditour.com/delete-account" />
</svelte:head>

<div class="min-h-screen bg-[#f7f3ea] px-5 pb-20 pt-28 text-[#17200f] sm:px-8">
	<div class="mx-auto max-w-xl">
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">Delete your Gidi Tour account</h1>
		<p class="mt-3 text-[#17200f]/65">
			This applies to the Gidi Tour website and the Gidi Tour app. You can also do it inside the app under You → Delete account.
		</p>

		<div class="mt-8 rounded-3xl bg-white p-6 shadow-sm">
			<h2 class="text-lg font-bold">What happens</h2>
			<ul class="mt-3 list-disc space-y-2 pl-5 text-sm text-[#17200f]/70">
				<li>Your profile, photo, phone number, address, emergency contact and travel notes are deleted.</li>
				<li>Your chats with guides are deleted. If you are a guide, your guide profile is removed.</li>
				<li>Past bookings and orders are kept for accounting and tax, but your name, contact details and notes are removed from them.</li>
				<li>This cannot be undone.</li>
				<li>If you have an upcoming paid trip, <a href="/contact" class="font-semibold text-[#5C9B19]">contact us</a> first so we can look after it.</li>
			</ul>
		</div>

		{#if done}
			<div class="mt-6 rounded-3xl bg-[#e4efd3] p-6">
				<p class="font-bold">Your account has been deleted.</p>
				<p class="mt-1 text-sm text-[#17200f]/70">Thank you for travelling with us.</p>
			</div>
		{:else if user}
			<form onsubmit={submit} class="mt-6 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
				<p class="text-sm text-[#17200f]/70">Signed in as <strong>{user.email}</strong></p>
				<div class="flex flex-col gap-1.5">
					<label for="d-pass" class="text-xs font-medium text-[#17200f]/60">Password (if you sign in with one)</label>
					<input id="d-pass" type="password" bind:value={password} autocomplete="current-password" class={input} />
				</div>
				<div class="flex flex-col gap-1.5">
					<label for="d-confirm" class="text-xs font-medium text-[#17200f]/60">Type DELETE to confirm</label>
					<input id="d-confirm" type="text" bind:value={confirm} autocomplete="off" class={input} />
				</div>
				{#if error}<p class="text-sm text-red-600">{error}</p>{/if}
				<button type="submit" disabled={busy || confirm !== 'DELETE'} class="rounded-full bg-red-600 px-6 py-3.5 font-bold text-white transition disabled:opacity-40">
					{busy ? 'Deleting…' : 'Delete my account'}
				</button>
			</form>
		{:else}
			<div class="mt-6 rounded-3xl bg-white p-6 shadow-sm">
				<p class="text-sm text-[#17200f]/70">Please sign in so we know the account is yours.</p>
				<a href="/login?redirectTo=/delete-account" class="mt-4 inline-block rounded-full bg-[#5C9B19] px-6 py-3.5 font-bold text-white">Sign in to continue</a>
				<p class="mt-5 text-sm text-[#17200f]/60">
					Can't sign in? <a href="/contact" class="font-semibold text-[#5C9B19]">Contact us</a> from the email address on the account and ask for it to be deleted. We reply within 30 days.
				</p>
			</div>
		{/if}
	</div>
</div>
