<script lang="ts">
  import { fly } from 'svelte/transition';
  import { reveal } from '$lib/utils/reveal';

  let {
    appStoreHref = 'https://apps.apple.com/app/gidi/id0000000000',
    playStoreHref = 'https://play.google.com/store/apps/details?id=com.gidi.app',
    compact = false,
    // Set to true on launch day. The buttons then become real store links.
    launched = false,
  }: {
    appStoreHref?: string;
    playStoreHref?: string;
    compact?: boolean;
    launched?: boolean;
  } = $props();

  type StoreKey = 'apple' | 'play';

  let openPopup = $state<StoreKey | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;

  const badgeClass = $derived(
    `inline-flex items-center gap-2 rounded-lg bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${
      compact ? 'px-3 py-2' : 'px-5 py-2.5'
    }`
  );

  function closePopup() {
    clearTimeout(timer);
    openPopup = null;
  }

  function togglePopup(key: StoreKey) {
    clearTimeout(timer);

    if (openPopup === key) {
      openPopup = null;
      return;
    }

    openPopup = key;
    timer = setTimeout(() => (openPopup = null), 3500);
  }

  // Close when the visitor clicks anywhere outside the buttons.
  function handleWindowClick(event: MouseEvent) {
    if (!openPopup) return;
    const target = event.target as HTMLElement | null;
    if (!target?.closest('[data-launch-wrap]')) closePopup();
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closePopup();
  }

  $effect(() => () => clearTimeout(timer));
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} />

{#snippet appleInner()}
  <svg
    class="shrink-0 {compact ? 'h-5 w-5' : 'h-6.5 w-6.5'}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#000"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zm3.594-3.281c.838-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.721-.688 3.56-1.702z"
    />
  </svg>
  <span class="flex flex-col text-left leading-[1.2]">
    {#if !compact}
      <span class="text-[8px] font-medium uppercase tracking-[.08em] text-[#6b6b74]">
        Download on the
      </span>
    {/if}
    <span class="font-bold text-[#0d0c15] {compact ? 'text-xs' : 'text-[14px] leading-tight'}">
      App Store
    </span>
  </span>
{/snippet}

{#snippet playInner()}
  <svg
    class="shrink-0 {compact ? 'h-5 w-5' : 'h-6.5 w-6.5'}"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path fill="#4285F4" d="M4,4 L4,20 L12,12 Z" />
    <path fill="#34A853" d="M4,4 L12,12 L16.8,10.4 Z" />
    <path fill="#FBBC04" d="M12,12 L16.8,10.4 L20,12 L16.8,13.6 Z" />
    <path fill="#EA4335" d="M4,20 L12,12 L16.8,13.6 Z" />
  </svg>
  <span class="flex flex-col text-left leading-[1.2]">
    {#if !compact}
      <span class="text-[8px] font-medium uppercase tracking-[.08em] text-[#6b6b74]">
        Get it on
      </span>
    {/if}
    <span class="font-bold text-[#0d0c15] {compact ? 'text-xs' : 'text-[14px] leading-tight'}">
      Google Play
    </span>
  </span>
{/snippet}

<!-- The small "launching soon" card that appears above a button -->
{#snippet popup(align: 'left' | 'right')}
  <div
    role="status"
    transition:fly|global={{ y: 6, duration: 180 }}
    class="absolute bottom-full z-50 mb-3 w-52 rounded-2xl bg-[#17200f] px-4 py-3 text-left shadow-xl {align ===
    'left'
      ? 'left-0'
      : 'right-0'}"
  >
    <p class="text-[10px] font-bold uppercase tracking-[.16em] text-[#F98315]">Launching soon</p>
    <p class="mt-1 text-xs leading-5 text-white/80">
      The Gidi Tour app is almost here. Stay tuned!
    </p>
    <span
      aria-hidden="true"
      class="absolute -bottom-1 h-2.5 w-2.5 rotate-45 bg-[#17200f] {align === 'left'
        ? 'left-6'
        : 'right-6'}"
    ></span>
  </div>
{/snippet}

{#snippet badges()}
  <!-- APP STORE -->
  <div class="relative" data-launch-wrap>
    {#if launched}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external App Store URL -->
      <a
        href={appStoreHref}
        class={badgeClass}
        aria-label="Download on the App Store"
        target="_blank"
        rel="noopener noreferrer"
      >
        {@render appleInner()}
      </a>
    {:else}
      <button
        type="button"
        onclick={() => togglePopup('apple')}
        class={badgeClass}
        aria-label="Gidi Tour app coming soon on the App Store"
        aria-expanded={openPopup === 'apple'}
      >
        {@render appleInner()}
      </button>

      {#if openPopup === 'apple'}
        {@render popup('left')}
      {/if}
    {/if}
  </div>

  <!-- GOOGLE PLAY -->
  <div class="relative" data-launch-wrap>
    {#if launched}
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external Google Play URL -->
      <a
        href={playStoreHref}
        class={badgeClass}
        aria-label="Get it on Google Play"
        target="_blank"
        rel="noopener noreferrer"
      >
        {@render playInner()}
      </a>
    {:else}
      <button
        type="button"
        onclick={() => togglePopup('play')}
        class={badgeClass}
        aria-label="Gidi Tour app coming soon on Google Play"
        aria-expanded={openPopup === 'play'}
      >
        {@render playInner()}
      </button>

      {#if openPopup === 'play'}
        {@render popup('right')}
      {/if}
    {/if}
  </div>
{/snippet}

{#if compact}
  <div class="flex flex-wrap items-center gap-3">
    {@render badges()}
  </div>
{:else}
  <section use:reveal class="px-5 sm:px-8 lg:px-12">
    <div class="mx-auto max-w-360">
      <p class="mb-4.5 text-[10px] font-bold uppercase tracking-widest text-black/55">
        Take Gidi with you
      </p>
      <div
        class="flex w-full flex-wrap items-center justify-center gap-4 md:flex-row md:justify-start"
      >
        {@render badges()}
      </div>
    </div>
  </section>
{/if}