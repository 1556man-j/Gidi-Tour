<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Camera, Trash2 } from 'lucide-svelte';
	import { countryDialCodes } from '$lib/data/countryDialCodes';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const initial = data.customer;

	let name = $state(initial?.name ?? '');
	let nationality = $state(initial?.nationality ?? '');
	let dateOfBirth = $state(initial?.dateOfBirth ?? '');
	let phoneDialCode = $state(initial?.phoneDialCode ?? '');
	let phoneNumber = $state(initial?.phoneNumber ?? '');
	let line1 = $state(initial?.address?.line1 ?? '');
	let line2 = $state(initial?.address?.line2 ?? '');
	let city = $state(initial?.address?.city ?? '');
	let region = $state(initial?.address?.region ?? '');
	let postalCode = $state(initial?.address?.postalCode ?? '');
	let addressCountry = $state(initial?.address?.country ?? '');
	let ecName = $state(initial?.emergencyContact?.name ?? '');
	let ecRelationship = $state(initial?.emergencyContact?.relationship ?? '');
	let ecPhone = $state(initial?.emergencyContact?.phone ?? '');
	let travelNotes = $state(initial?.travelNotes ?? '');

	let saving = $state(false);
	let saved = $state(false);
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});

	let avatarBusy = $state(false);
	let avatarError = $state('');

	const today = new Date().toISOString().split('T')[0];
	const avatarUrl = $derived(data.customer?.avatarUrl ?? null);
	const initialLetter = $derived((data.customer?.name ?? data.customer?.email ?? '?').charAt(0).toUpperCase());

	function onNationalityChange() {
		const match = countryDialCodes.find((c) => c.name === nationality);
		if (match && !phoneNumber) phoneDialCode = match.dialCode;
	}

	async function onAvatarSelected(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		avatarError = '';
		if (file.size > 5 * 1024 * 1024) {
			avatarError = 'Please choose an image under 5MB.';
			return;
		}

		avatarBusy = true;
		const body = new FormData();
		body.append('avatar', file);

		const res = await fetch('/api/account/avatar', { method: 'POST', body });
		avatarBusy = false;
		input.value = '';

		if (!res.ok) {
			const result = await res.json().catch(() => ({}));
			avatarError = result.error ?? 'Upload failed. Please try again.';
			return;
		}
		await invalidateAll();
	}

	async function removeAvatar() {
		avatarBusy = true;
		await fetch('/api/account/avatar', { method: 'DELETE' });
		avatarBusy = false;
		await invalidateAll();
	}

	async function saveProfile() {
		saving = true;
		saved = false;
		formError = '';
		fieldErrors = {};

		const res = await fetch('/api/account/update-profile', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name,
				nationality,
				dateOfBirth,
				phoneDialCode,
				phoneNumber,
				address: { line1, line2, city, region, postalCode, country: addressCountry },
				emergencyContact: { name: ecName, relationship: ecRelationship, phone: ecPhone },
				travelNotes
			})
		});
		const result = await res.json().catch(() => ({}));
		saving = false;

		if (!res.ok) {
			fieldErrors = result.fieldErrors ?? {};
			formError = result.error ?? 'Could not save. Please try again.';
			return;
		}

		saved = true;
		await invalidateAll(); // re-runs the root layout load, so the whole site picks up the change
	}

	const inputClass =
		'w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none transition focus:border-[#5C9B19]';
</script>

<section class="mx-auto max-w-2xl px-5 py-24">
	<h1 class="text-3xl font-bold text-[#17200f]">Profile</h1>
	<p class="mt-2 text-sm text-[#17200f]/60">
		Everything here is optional except your name. It's used to speed up bookings.
	</p>

	<!-- PHOTO -->
	<div class="mt-8 flex items-center gap-5 rounded-[24px] border border-black/10 bg-white p-6">
		{#if avatarUrl}
			<img src={avatarUrl} alt="Your profile" class="h-20 w-20 rounded-full object-cover" />
		{:else}
			<div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#5C9B19]/10 text-2xl font-bold text-[#5C9B19]">
				{initialLetter}
			</div>
		{/if}

		<div>
			<div class="flex flex-wrap gap-2">
				<label class="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-xs font-bold text-[#17200f] transition hover:border-[#5C9B19]">
					<Camera class="h-3.5 w-3.5" aria-hidden="true" />
					{avatarBusy ? 'Uploading…' : avatarUrl ? 'Change photo' : 'Add photo'}
					<input
						type="file"
						accept="image/jpeg,image/png,image/webp"
						class="hidden"
						disabled={avatarBusy}
						onchange={onAvatarSelected}
					/>
				</label>
				{#if avatarUrl}
					<button
						type="button"
						onclick={removeAvatar}
						disabled={avatarBusy}
						class="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold text-red-500 transition hover:bg-red-50"
					>
						<Trash2 class="h-3.5 w-3.5" aria-hidden="true" />
						Remove
					</button>
				{/if}
			</div>
			<p class="mt-2 text-xs text-[#17200f]/40">JPG, PNG or WebP, up to 5MB.</p>
			{#if avatarError}<p class="mt-1 text-xs text-red-500">{avatarError}</p>{/if}
		</div>
	</div>

	<form onsubmit={(e) => { e.preventDefault(); saveProfile(); }} class="mt-6 flex flex-col gap-6">
		<!-- PERSONAL -->
		<div class="rounded-[24px] border border-black/10 bg-white p-6">
			<p class="mb-4 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Personal</p>
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="p-name" class="text-xs font-medium text-[#17200f]/60">Full name</label>
					<input id="p-name" type="text" bind:value={name} class={inputClass} />
					{#if fieldErrors.name}<p class="text-xs text-red-500">{fieldErrors.name}</p>{/if}
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="p-email" class="text-xs font-medium text-[#17200f]/60">Email</label>
					<input id="p-email" type="email" value={data.customer?.email ?? ''} disabled class="{inputClass} bg-[#f7f3ea] text-[#17200f]/50" />
					<p class="text-xs text-[#17200f]/40">Your email is your login, so it can't be changed here.</p>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="flex flex-col gap-1.5">
						<label for="p-nationality" class="text-xs font-medium text-[#17200f]/60">Nationality</label>
						<select id="p-nationality" bind:value={nationality} onchange={onNationalityChange} class="{inputClass} bg-white">
							<option value="">Select nationality</option>
							{#each countryDialCodes as country (country.code)}
								<option value={country.name}>{country.name}</option>
							{/each}
						</select>
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="p-dob" class="text-xs font-medium text-[#17200f]/60">Date of birth</label>
						<input id="p-dob" type="date" max={today} bind:value={dateOfBirth} class={inputClass} />
						{#if fieldErrors.dateOfBirth}<p class="text-xs text-red-500">{fieldErrors.dateOfBirth}</p>{/if}
					</div>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="p-phone" class="text-xs font-medium text-[#17200f]/60">Phone number</label>
					<div class="flex gap-2">
						<div class="flex w-24 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-[#f7f3ea] px-2 text-sm font-semibold text-[#17200f]/70">
							{phoneDialCode || '+--'}
						</div>
						<input id="p-phone" type="tel" bind:value={phoneNumber} class="{inputClass} flex-1" />
					</div>
					{#if fieldErrors.phoneNumber}<p class="text-xs text-red-500">{fieldErrors.phoneNumber}</p>{/if}
				</div>
			</div>
		</div>

		<!-- ADDRESS -->
		<div class="rounded-[24px] border border-black/10 bg-white p-6">
			<p class="mb-4 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Address</p>
			<div class="flex flex-col gap-4">
				<input type="text" bind:value={line1} placeholder="Address line 1" aria-label="Address line 1" class={inputClass} />
				<input type="text" bind:value={line2} placeholder="Address line 2 (optional)" aria-label="Address line 2" class={inputClass} />
				<div class="grid gap-4 sm:grid-cols-2">
					<input type="text" bind:value={city} placeholder="City" aria-label="City" class={inputClass} />
					<input type="text" bind:value={region} placeholder="State / Region" aria-label="State or region" class={inputClass} />
					<input type="text" bind:value={postalCode} placeholder="Postal code" aria-label="Postal code" class={inputClass} />
					<input type="text" bind:value={addressCountry} placeholder="Country" aria-label="Country" class={inputClass} />
				</div>
			</div>
		</div>

		<!-- EMERGENCY CONTACT -->
		<div class="rounded-[24px] border border-black/10 bg-white p-6">
			<p class="mb-1 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Emergency contact</p>
			<p class="mb-4 text-xs text-[#17200f]/40">Someone we can reach if something goes wrong on a trip.</p>
			<div class="grid gap-4 sm:grid-cols-2">
				<input type="text" bind:value={ecName} placeholder="Name" aria-label="Emergency contact name" class={inputClass} />
				<input type="text" bind:value={ecRelationship} placeholder="Relationship" aria-label="Relationship" class={inputClass} />
				<input type="tel" bind:value={ecPhone} placeholder="Phone (with country code)" aria-label="Emergency contact phone" class="{inputClass} sm:col-span-2" />
			</div>
		</div>

		<!-- TRAVEL NOTES -->
		<div class="rounded-[24px] border border-black/10 bg-white p-6">
			<p class="mb-4 text-xs font-bold uppercase tracking-wide text-[#17200f]/50">Travel notes</p>
			<textarea
				bind:value={travelNotes}
				rows="3"
				maxlength="1000"
				placeholder="Dietary requirements, accessibility needs, anything we should always know."
				aria-label="Travel notes"
				class="{inputClass} resize-y"
			></textarea>
		</div>

		{#if formError}<p class="text-sm text-red-500" role="alert">{formError}</p>{/if}

		<button
			type="submit"
			disabled={saving}
			class="rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316] disabled:opacity-50"
		>
			{saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
		</button>
	</form>
</section>