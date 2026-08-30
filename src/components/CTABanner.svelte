<script lang="ts">
  import { reveal } from '$lib/utils/reveal';
  import { ArrowRight } from 'lucide-svelte';

  type CtaBanner = {
    eyebrow?: string;
    heading: string;
    headingHighlight?: string;
    subcopy?: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
    variant?: 'brand' | 'default';
  };

  let { banner }: { banner?: CtaBanner } = $props();

  const fallbackBanner: CtaBanner = {
    eyebrow: 'Ready when you are',
    heading: 'Your next trip starts with a single curious question.',
    headingHighlight: 'curious question.',
    subcopy: 'Tell us where you want to go, and we\u2019ll handle the rest; flights, stays and the experiences that make it unforgettable.',
    primaryLabel: 'Book a tour',
    primaryHref: '/book',
    secondaryLabel: 'Talk to us',
    secondaryHref: '/contact',
    variant: 'brand',
  };

  const activeBanner = $derived(banner ?? fallbackBanner);

  // Splits on every occurrence of headingHighlight so it can appear more than
  // once in the heading; each gap between parts gets the gradient treatment.
  const headingParts = $derived(
    activeBanner.headingHighlight
      ? activeBanner.heading.split(activeBanner.headingHighlight)
      : [activeBanner.heading]
  );
</script>

{#if activeBanner}
  <section use:reveal class="px-5 sm:px-8 lg:px-12">
    <div class="mx-auto max-w-[1440px]">
      <div class="relative overflow-hidden rounded-[28px] py-16 md:py-20">
        <!-- Gradient overlay -->
        {#if activeBanner.variant === 'brand'}
          <div
            aria-hidden="true"
            class="pointer-events-none absolute inset-0"
            style="background:radial-gradient(50% 70% at 50% 0%, rgba(249,131,21,0.16), transparent 70%)"
          ></div>
        {/if}

        <div class="relative mx-auto max-w-[720px] px-6 text-center text-black">
          {#if activeBanner.eyebrow}
            <span
              class="mb-3.5 inline-block rounded-full bg-white/10 px-4 py-1.5 text-[17px] font-bold capitalize text-[#F98315]"
            >
              {activeBanner.eyebrow}
            </span>
          {/if}

          <h2 class="font-bold text-[clamp(28px,4vw,44px)] leading-[1.15] tracking-[-.02em]">
            {#each headingParts as part, i}
              {part}{#if activeBanner.headingHighlight && i < headingParts.length - 1}<span
                  class="text-[#5C9B19]">{activeBanner.headingHighlight}</span
                >{/if}
            {/each}
          </h2>

          {#if activeBanner.subcopy}
            <p class="mx-auto mb-7 mt-3.5 max-w-[540px] text-[clamp(15px,2vw,18px)] leading-relaxed text-black/70">
              {activeBanner.subcopy}
            </p>
          {/if}

          <div class="flex flex-wrap justify-center gap-3.5">
            <a
              href={activeBanner.primaryHref}
              class="inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-6 py-3 text-sm font-bold text-white shadow-md transition hover:scale-105"
            >
              {activeBanner.primaryLabel}
              <ArrowRight class="w-4 h-4" aria-hidden="true" />
            </a>
            {#if activeBanner.secondaryLabel && activeBanner.secondaryHref}
              <a
                href={activeBanner.secondaryHref}
                class="inline-flex items-center rounded-full border border-black/20 px-6 py-3 text-sm font-bold text-black transition hover:bg-white/10"
              >
                {activeBanner.secondaryLabel}
              </a>
            {/if}
          </div>
        </div>
      </div>
    </div>
  </section>
{/if}