<script lang="ts">
  import { reveal } from '$lib/utils/reveal';
  import DownloadApp from './DownloadApp.svelte';

  type SocialLinks = {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    youtube?: string;
    tiktok?: string;
  };

  type SiteSettings = { socialLinks?: SocialLinks };

  let { siteSettings }: { siteSettings?: SiteSettings } = $props();

  const currentYear = new Date().getFullYear();

  const fallbackSocials: SocialLinks = {
    instagram: 'https://www.instagram.com/gidi_tour?stkn=dHpkbGhoMDB1eWpi',
    twitter: 'https://x.com/gidi_tour?s=11',
    tiktok: 'https://www.tiktok.com/@gidi_tour?_r=1&_t=ZS-99dwaBlufVV',
    youtube: 'https://youtube.com/@gidi_tour?si=CSeBJcpEIIVmEHb3',
  };

  const socialLinks = $derived(siteSettings?.socialLinks ?? fallbackSocials);
</script>

<footer use:reveal class="border-t border-black/10 px-5 pt-14 text-black sm:px-8 lg:px-12">
  <div class="mx-auto max-w-[1440px]">
    <div class="grid w-full grid-cols-1 gap-6 md:grid-cols-3 md:gap-9">
      <!-- Brand column -->
      <div class="col-span-2 md:col-span-1">
        <a href="/" >
          <img src="images/assets/LOGO-3.png" alt="logo" class="w-50 ">
        </a>
        <p class="mt-3.5 mb-4 max-w-[260px] text-sm text-black/70">
          Trips designed to bring you closer to the culture, people, food and stories that make each
          destination unforgettable. Go curious.
        </p>
        <div class="flex gap-2">
          {#if socialLinks.facebook}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external social link -->
            <a
              href={socialLinks.facebook}
              class="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black transition hover:border-[#F98315] hover:bg-[#F98315] hover:text-white"
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M22 12.06C22 6.51 17.52 2 12 2S2 6.51 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z"
                /></svg
              >
            </a>
          {/if}
          {#if socialLinks.instagram}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external social link -->
            <a
              href={socialLinks.instagram}
              class="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black transition hover:border-[#F98315] hover:bg-[#F98315] hover:text-white"
              aria-label="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M12 2.16c3.2 0 3.58 0 4.85.07 1.17.06 1.8.25 2.23.42.56.22.96.48 1.38.9.42.42.68.82.9 1.38.17.42.36 1.06.42 2.23.06 1.27.07 1.65.07 4.85s0 3.58-.07 4.85c-.06 1.17-.25 1.8-.42 2.23a3.7 3.7 0 0 1-.9 1.38c-.42.42-.82.68-1.38.9-.42.17-1.06.36-2.23.42-1.27.06-1.65.07-4.85.07s-3.58 0-4.85-.07c-1.17-.06-1.8-.25-2.23-.42a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.17-.42-.36-1.06-.42-2.23C2.17 15.58 2.16 15.2 2.16 12s0-3.58.07-4.85c.06-1.17.25-1.8.42-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.17 1.06-.36 2.23-.42C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33 0 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05 0 8.33 0 8.74 0 12s0 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.86 5.86 0 0 0 1.38 2.13 5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 24 8.74 24 12 24s3.67 0 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.07-1.28.07-1.69.07-4.95s0-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67 0 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16A4 4 0 1 1 12 8a4 4 0 0 1 0 8ZM19.85 5.6a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"
                /></svg
              >
            </a>
          {/if}
          {#if socialLinks.twitter}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external social link -->
            <a
              href={socialLinks.twitter}
              class="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black transition hover:border-[#F98315] hover:bg-[#F98315] hover:text-white"
              aria-label="Twitter / X"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25h8.04l4.71 6.231L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z"
                /></svg
              >
            </a>
          {/if}
          {#if socialLinks.linkedin}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external social link -->
            <a
              href={socialLinks.linkedin}
              class="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black transition hover:border-[#F98315] hover:bg-[#F98315] hover:text-white"
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.63-1.86 3.36-1.86 3.59 0 4.26 2.37 4.26 5.45v6.3ZM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.74v20.51C0 23.22.79 24 1.77 24h20.45c.99 0 1.78-.78 1.78-1.75V1.74C24 .78 23.21 0 22.22 0Z"
                /></svg
              >
            </a>
          {/if}
          {#if socialLinks.youtube}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external social link -->
            <a
              href={socialLinks.youtube}
              class="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black transition hover:border-[#F98315] hover:bg-[#F98315] hover:text-white"
              aria-label="YouTube"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M23.5 6.2a3 3 0 0 0-2.12-2.13C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.52A3 3 0 0 0 .5 6.2C0 8.08 0 12 0 12s0 3.92.5 5.8a3 3 0 0 0 2.12 2.13C4.5 20.45 12 20.45 12 20.45s7.5 0 9.38-.52a3 3 0 0 0 2.12-2.13C24 15.92 24 12 24 12s0-3.92-.5-5.8ZM9.6 15.6V8.4l6.24 3.6L9.6 15.6Z"
                /></svg
              >
            </a>
          {/if}
          {#if socialLinks.tiktok}
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external social link -->
            <a
              href={socialLinks.tiktok}
              class="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-black/20 text-black transition hover:border-[#F98315] hover:bg-[#F98315] hover:text-white"
              aria-label="TikTok"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"
                ><path
                  d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z"
                /></svg
              >
            </a>
          {/if}
        </div>
      </div>

      <!-- Explore column -->
      <div>
        <h5 class="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#F98315]">Explore</h5>
        <ul class="flex flex-col gap-2">
          <li><a href="/tours" class="text-[13px] text-black/70 transition hover:text-[#F98315]">Experiences</a></li>
          <li><a href="/stories" class="text-[13px] text-black/70 transition hover:text-[#F98315]">Stories</a></li>
          <li><a href="/destinations" class="text-[13px] text-black/70 transition hover:text-[#F98315]">Destinations</a></li>
          <li><a href="/about" class="text-[13px] text-black/70 transition hover:text-[#F98315]">About Us</a></li>
          <li><a href="/contact" class="text-[13px] text-black/70 transition hover:text-[#F98315]">Contact</a></li>
          <li><a href="/career" class="text-[13px] text-black/70 transition hover:text-[#F98315]">Careers</a></li>
        </ul>
      </div>

      <!-- Get the app column -->
      <div class="col-span-2 md:col-span-1">
        <h5 class="mb-4 text-[11px] font-bold uppercase tracking-[.18em] text-[#F98315]">Get the app</h5>
        <DownloadApp compact />
      </div>
    </div>

    <div class="my-8 h-px bg-black/10"></div>

    <div class="flex flex-col gap-1 pb-5 text-[11px] text-black/60 md:flex-row md:items-center md:justify-between">
      <span>&copy; {currentYear} Gidi. All rights reserved.</span>
      <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external credit link -->
      <a href="https://nxtedgestudio.com" target="_blank" rel="noopener noreferrer" class="opacity-80 transition hover:text-[#F98315] hover:opacity-100">
        Built by codewithnuel
      </a>
    </div>
  </div>
</footer>