<script lang="ts">
  import { reveal } from '$lib/utils/reveal';

  let {
    appStoreHref = 'https://apps.apple.com/app/gidi/id0000000000',
    playStoreHref = 'https://play.google.com/store/apps/details?id=com.gidi.app',
    compact = false,
  }: { appStoreHref?: string; playStoreHref?: string; compact?: boolean } = $props();
</script>

{#snippet badges()}
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external App Store URL -->
  <a
    href={appStoreHref}
    class="inline-flex items-center gap-2 rounded-lg bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 {compact
      ? 'px-3 py-2'
      : 'px-5 py-2.5'}"
    aria-label="Download on the App Store"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg class="shrink-0 {compact ? 'h-5 w-5' : 'h-[26px] w-[26px]'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="#000"
        d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.594-3.281c.838-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.721-.688 3.56-1.702z"
      />
    </svg>
    <span class="flex flex-col leading-[1.2]">
      {#if !compact}
        <span class="text-[8px] font-medium uppercase tracking-[.08em] text-[#6b6b74]">Download on the</span>
      {/if}
      <span class="font-bold text-[#0d0c15] {compact ? 'text-xs' : 'text-[14px] leading-[1.25]'}">App Store</span>
    </span>
  </a>

  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external Google Play URL -->
  <a
    href={playStoreHref}
    class="inline-flex items-center gap-2 rounded-lg bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 {compact
      ? 'px-3 py-2'
      : 'px-5 py-2.5'}"
    aria-label="Get it on Google Play"
    target="_blank"
    rel="noopener noreferrer"
  >
    <svg class="shrink-0 {compact ? 'h-5 w-5' : 'h-[26px] w-[26px]'}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M4,4 L4,20 L12,12 Z" />
      <path fill="#34A853" d="M4,4 L12,12 L16.8,10.4 Z" />
      <path fill="#FBBC04" d="M12,12 L16.8,10.4 L20,12 L16.8,13.6 Z" />
      <path fill="#EA4335" d="M4,20 L12,12 L16.8,13.6 Z" />
    </svg>
    <span class="flex flex-col leading-[1.2]">
      {#if !compact}
        <span class="text-[8px] font-medium uppercase tracking-[.08em] text-[#6b6b74]">Get it on</span>
      {/if}
      <span class="font-bold text-[#0d0c15] {compact ? 'text-xs' : 'text-[14px] leading-[1.25]'}">Google Play</span>
    </span>
  </a>
{/snippet}

{#if compact}
  <div class="flex flex-wrap items-center gap-3">
    {@render badges()}
  </div>
{:else}
  <section use:reveal class="px-5 sm:px-8 lg:px-12">
    <div class="mx-auto max-w-[1440px]">
      <p class="mb-[18px] text-[10px] font-bold uppercase tracking-[.10em] text-black/55">Take Gidi with you</p>
      <div class="flex w-full flex-wrap items-center justify-center gap-4 md:flex-row md:justify-start">
        {@render badges()}
      </div>
    </div>
  </section>
{/if}