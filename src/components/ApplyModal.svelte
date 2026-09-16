<script lang="ts">
	import { X, Copy, Check } from 'lucide-svelte';

	interface Props {
		roleTitle: string;
		onClose: () => void;
	}

	let { roleTitle, onClose }: Props = $props();

	const subject = $derived(`Application: ${roleTitle}`);
	const careersEmail = 'support@giditour.com';

	let copied = $state(false);
	async function copySubject() {
		await navigator.clipboard.writeText(subject);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div
	class="fixed inset-0 z-110 flex items-center justify-center bg-black/60 p-4"
	onclick={onClose}
	role="presentation"
>
	<!-- svelte-ignore a11y_interactive_supports_focus -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl"
		onclick={(e) => e.stopPropagation()}
		role="dialog"
		aria-modal="true"
	>
		<div class="mb-5 flex items-start justify-between">
			<div>
				<p class="text-xs font-bold uppercase tracking-wide text-[#5C9B19]">Apply</p>
				<h3 class="mt-1 text-xl font-semibold text-[#17200f]">{roleTitle}</h3>
			</div>
			<button
				type="button"
				onclick={onClose}
				aria-label="Close"
				class="flex h-10 w-10 items-center justify-center rounded-full text-[#17200f]/50 transition hover:bg-black/5"
			>
				<X class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		<p class="text-sm leading-relaxed text-[#17200f]/70">
			Send your application by email — no forms, just a real note.
		</p>

		<div class="mt-5 rounded-2xl bg-[#f7f3ea] p-4">
			<p class="text-xs font-semibold uppercase tracking-wide text-[#17200f]/50">Send to</p>
			<a href={`mailto:${careersEmail}`} class="mt-1 block text-sm font-semibold text-[#5C9B19]">
				{careersEmail}
			</a>
		</div>

		<div class="mt-4 rounded-2xl bg-[#f7f3ea] p-4">
			<div class="flex items-center justify-between">
				<p class="text-xs font-semibold uppercase tracking-wide text-[#17200f]/50">Subject line</p>
				<button
					type="button"
					onclick={copySubject}
					class="flex items-center gap-1 text-xs font-semibold text-[#5C9B19] transition hover:text-[#F98315]"
				>
					{#if copied}
						<Check class="h-3.5 w-3.5" aria-hidden="true" /> Copied
					{:else}
						<Copy class="h-3.5 w-3.5" aria-hidden="true" /> Copy
					{/if}
				</button>
			</div>
			<p class="mt-1 text-sm font-medium text-[#17200f]">{subject}</p>
		</div>

		<div class="mt-5">
			<p class="text-xs font-semibold uppercase tracking-wide text-[#17200f]/50">Include</p>
			<ul class="mt-2 flex flex-col gap-1.5 text-sm text-[#17200f]/75">
				<li>• Your CV</li>
				<li>• A short note about a place that changed how you see things</li>
				<li>• Anything else you'd want us to know</li>
			</ul>
		</div>

		<a
			href={`mailto:${careersEmail}?subject=${encodeURIComponent(subject)}`}
			class="mt-6 flex w-full items-center justify-center rounded-full bg-[#5C9B19] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4c8316]"
		>
			Open my email app
		</a>
	</div>
</div>