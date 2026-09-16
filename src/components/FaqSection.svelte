<script lang="ts">
	import { ChevronDown } from 'lucide-svelte';
	import type { SanityFaq } from '$lib/sanity/queries/faq';

	interface Props {
		faqs: SanityFaq[];
		heading?: string;
		eyebrow?: string;
	}

	let { faqs, heading = 'Before you hit submit.', eyebrow = 'Common Questions' }: Props = $props();

	let openFaq = $state<number | null>(null);
</script>

{#if faqs.length > 0}
	<section class="bg-[#f7f3ea] px-5 pb-24 sm:px-8 lg:px-12">
		<div class="mx-auto max-w-3xl">
			<div class="text-center">
				<span class="inline-flex rounded-full bg-white px-4 py-1.5 text-[17px] font-bold capitalize text-[#5C9B19] shadow-sm">
					{eyebrow}
				</span>
				<h2 class="mt-5 text-4xl font-bold leading-[1.05] tracking-[-.03em] text-[#17200f] sm:text-5xl">
					{heading}
				</h2>
			</div>

			<div class="mt-12 divide-y divide-black/10 border-y border-black/10">
				{#each faqs as faq, i (faq._id)}
					<div>
						<button
							type="button"
							onclick={() => (openFaq = openFaq === i ? null : i)}
							aria-expanded={openFaq === i}
							class="flex w-full items-center justify-between gap-4 py-5 text-left transition hover:bg-black/[0.02]"
						>
							<span class="text-lg font-medium text-[#17200f]">{faq.question}</span>
							<ChevronDown
								class="h-5 w-5 flex-shrink-0 text-[#17200f]/40 transition-transform duration-300 {openFaq === i ? 'rotate-180' : ''}"
								aria-hidden="true"
							/>
						</button>
						<div
							class="grid overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] {openFaq === i
								? 'grid-rows-[1fr] pb-6 opacity-100'
								: 'grid-rows-[0fr] opacity-0'}"
						>
							<div class="min-h-0 overflow-hidden pr-8">
								<p class="max-w-xl text-[15px] leading-relaxed text-[#17200f]/60">{faq.answer}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>
{/if}