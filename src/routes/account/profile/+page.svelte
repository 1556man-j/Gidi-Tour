<script lang="ts">
	import { countryDialCodes } from '$lib/data/countryDialCodes';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let name = $state(data.customer?.name ?? '');
	let nationality = $state(data.customer?.nationality ?? '');
	let phoneDialCode = $state(data.customer?.phoneDialCode ?? '');
	let phoneNumber = $state(data.customer?.phoneNumber ?? '');

	let saving = $state(false);
	let saved = $state(false);

	function onNationalityChange() {
		const match = countryDialCodes.find((c) => c.name === nationality);
		if (match) phoneDialCode = match.dialCode;
	}

	async function saveProfile() {
		saving = true;
		saved = false;
		await fetch('/api/account/update-profile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name, phoneDialCode, phoneNumber, nationality })
		});
		saving = false;
		saved = true;
	}
</script>

<section class="mx-auto max-w-md px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Profile</h1>
	<p class="mt-2 text-sm text-[#17200f]/60">{data.customer?.email}</p>

	<form onsubmit={(e) => { e.preventDefault(); saveProfile(); }} class="mt-6 flex flex-col gap-4">
		<div class="flex flex-col gap-1.5">
			<label for="profile-name" class="text-xs font-medium text-[#17200f]/60">Full name</label>
			<input
				id="profile-name"
				type="text"
				bind:value={name}
				class="rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
			/>
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="profile-nationality" class="text-xs font-medium text-[#17200f]/60">Nationality</label>
			<select
				id="profile-nationality"
				bind:value={nationality}
				onchange={onNationalityChange}
				class="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
			>
				<option value="" disabled>Select your nationality</option>
				{#each countryDialCodes as country (country.code)}
					<option value={country.name}>{country.name}</option>
				{/each}
			</select>
		</div>

		<div class="flex flex-col gap-1.5">
			<label for="profile-phone" class="text-xs font-medium text-[#17200f]/60">Phone number</label>
			<div class="flex gap-2">
				<div class="flex w-24 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-[#f7f3ea] px-2 text-sm font-semibold text-[#17200f]/70">
					{phoneDialCode || '+--'}
				</div>
				<input
					id="profile-phone"
					type="tel"
					bind:value={phoneNumber}
					class="flex-1 rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:border-[#5C9B19]"
				/>
			</div>
		</div>

		<button
			type="submit"
			disabled={saving}
			class="mt-2 rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-50"
		>
			{saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
		</button>
	</form>
</section>