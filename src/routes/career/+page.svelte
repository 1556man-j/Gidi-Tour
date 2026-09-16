<script lang="ts">
	import { reveal } from '$lib/utils/reveal';
	import { ArrowUpRight, MapPin, Clock, Plus, Minus, Quote, Send } from 'lucide-svelte';
	import { urlFor } from '$lib/sanity/client';
	import ApplyModal from '../../components/ApplyModal.svelte';
	import type { PageData } from './$types';
	import SeoHead from '../../components/SeoHead.svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	const positions = $derived(data.positions ?? []);
	const postcards = $derived(data.postcards ?? []);
	const quotes = $derived(data.quotes ?? []);

	let openRole: number | null = $state(0);
	function toggleRole(i: number) {
		openRole = openRole === i ? null : i;
	}

	let applyModalRole = $state<string | null>(null);


	const seoTitle = $derived(
	data.pageSeo?.metaTitle ?? data.siteSettings?.defaultSeo?.metaTitle ?? 'Careers — Gidi Tour'
);
const seoDescription = $derived(
	data.pageSeo?.metaDescription ?? data.siteSettings?.defaultSeo?.metaDescription
);
const seoImage = $derived(data.pageSeo?.ogImage ?? data.siteSettings?.defaultSeo?.ogImage);
</script>

<SeoHead
	title={seoTitle}
	description={seoDescription}
	image={seoImage}
	url="https://giditour.com/careers"
	siteName={data.siteSettings?.siteName}
/>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- ============ HERO ============ -->
<section
	class="hero relative isolate flex min-h-25 w-full items-end overflow-hidden bg-[#101809]"
>
	<img
		src="/images/assets/cape-town-2.webp"
		alt="A Gidi Tour team member briefing a small group at sunrise"
		class="absolute inset-0 h-full w-full object-cover opacity-70"
	/>
	<div
		class="absolute inset-0"
		style="background: linear-gradient(180deg, rgba(16,24,9,0.15) 0%, rgba(16,24,9,0.55) 55%, rgba(16,24,9,0.94) 100%);"
		aria-hidden="true"
	></div>

	<div class="relative mx-auto w-full max-w-[1180px] px-6 pb-16 pt-20 sm:px-10 sm:pb-20 lg:px-14">
		<p class="hero-line hero-line--1 mb-6 text-sm font-medium text-white/70">
			Careers at Gidi Tour
		</p>

		<h1
			class="hero-line hero-line--2 max-w-[17ch] text-[clamp(2.4rem,5.4vw,4.4rem)] font-medium leading-[1.05] text-white"
			style="font-family: 'Fraunces', serif;"
		>
			We hire people who’ve already fallen for a place they didn’t grow up in.
		</h1>

		<p class="hero-line hero-line--3 mt-7 max-w-[46ch] text-[17px] leading-relaxed text-white/75">
			Gidi Tour is small on purpose. Every person here has designed a route, argued with a supplier,
			or answered a 2am message from someone stuck at a border. The roles below are open because
			we're genuinely short-handed for the trips ahead of us.
		</p>

		<div class="hero-line hero-line--4 mt-10 flex flex-wrap items-center gap-5">
			<a
				href="#roles"
				class="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#101809] transition hover:bg-[#F98315] hover:text-white"
			>
				See open roles
				<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
			</a>
			<span class="stamp-badge" aria-hidden="true">
				<svg viewBox="0 0 96 96" class="h-16 w-16">
					<circle
						cx="48"
						cy="48"
						r="43"
						fill="none"
						stroke="#F98315"
						stroke-width="2"
						stroke-dasharray="4 3"
					/>
					<text
						x="48"
						y="42"
						text-anchor="middle"
						font-size="9"
						font-weight="600"
						fill="#F98315"
						font-family="Inter, sans-serif"
					>
						NOW HIRING
					</text>
					<text
						x="48"
						y="60"
						text-anchor="middle"
						font-size="8"
						fill="#F98315"
						font-family="Inter, sans-serif"
					>
						5 ROLES OPEN
					</text>
				</svg>
			</span>
		</div>
	</div>
</section>

<!-- ============ WHAT THE WORK IS ============ -->
<section class="bg-[#f7f3ea] px-6 py-20 sm:px-10 sm:py-28 lg:px-14" use:reveal>
	<div class="reveal mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
		<p class="text-[15px] leading-relaxed text-[#17200f]/60">What working here is actually like</p>
		<div>
			<p
				class="max-w-[38ch] text-[26px] font-medium leading-[1.4] text-[#17200f] sm:text-[30px]"
				style="font-family: 'Fraunces', serif; font-style: italic;"
			>
				There is no separate "content team" that has never been to the places we write about, and no
				"ops team" that has never spoken to a traveler.
			</p>
			<p class="mt-6 max-w-[54ch] text-[16px] leading-relaxed text-[#17200f]/70">
				Most weeks, you'll do work outside the title on your CV — a curator sitting in on a support
				call, a marketer rebuilding a day of an itinerary that wasn't landing. If that sounds like
				more responsibility than structure, it is. We pay for it accordingly, and we tell you that
				up front rather than discovering it three months in.
			</p>
		</div>
	</div>
</section>

<!-- ============ OPEN ROLES ============ -->
<section
	id="roles"
	class="bg-[#101809] px-6 py-20 rounded-4xl text-white sm:px-10 sm:py-28 lg:px-14"
	use:reveal
>
	<div class="reveal mx-auto max-w-[880px]">
		<div class="mb-14 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<h2
				class="text-[clamp(1.9rem,3.4vw,2.6rem)] font-medium leading-tight"
				style="font-family: 'Fraunces', serif;"
			>
				Open roles
			</h2>
			<p class="text-sm text-white/50">{positions.length} positions · updated this month</p>
		</div>

		<ul class="divide-y divide-white/10 border-y border-white/10">
			{#each positions as role, i (role._id)}
				<li>
					<button
						type="button"
						class="flex w-full items-center justify-between gap-6 py-7 text-left"
						onclick={() => toggleRole(i)}
						aria-expanded={openRole === i}
					>
						<span class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-5">
							<span class="text-lg font-medium sm:text-xl">{role.title}</span>
							<span class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/50">
								<span class="inline-flex items-center gap-1.5">
									<MapPin class="h-3.5 w-3.5" aria-hidden="true" />
									{role.location}
								</span>
								<span class="inline-flex items-center gap-1.5">
									<Clock class="h-3.5 w-3.5" aria-hidden="true" />
									{role.commitment}
								</span>
								<span>{role.team}</span>
							</span>
						</span>
						<span
							class="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-white/20"
						>
							{#if openRole === i}
								<Minus class="h-3.5 w-3.5" aria-hidden="true" />
							{:else}
								<Plus class="h-3.5 w-3.5" aria-hidden="true" />
							{/if}
						</span>
					</button>

					{#if openRole === i}
						<div class="grid gap-6 pb-8 sm:grid-cols-[1fr_auto] sm:items-end">
							<p class="max-w-[56ch] text-[15px] leading-relaxed text-white/70">
								{role.summary}
							</p>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<button
								type="button"
								onclick={() => (applyModalRole = role.title)}
								class="inline-flex w-fit items-center gap-2 rounded-full bg-[#5C9B19] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#F98315]"
							>
								Apply for this role
								<ArrowUpRight class="h-4 w-4" aria-hidden="true" />
							</button>
						</div>
					{/if}
				</li>
			{/each}
		</ul>

		<p class="mt-8 text-sm text-white/45">
			Don't see your fit? Write to
			<a href="mailto:support@giditour.com" class="underline decoration-white/30 underline-offset-4"
				>support@giditour.com</a
			>
			and tell us what you'd want to work on.
		</p>
	</div>
</section>

<!-- ============ LIFE AT GIDI — SCATTERED POSTCARDS ============ -->
<section class="bg-[#f7f3ea] py-20 sm:py-28" use:reveal>
	<div class="reveal mx-auto max-w-295 px-6 sm:px-10 lg:px-14">
		<p
			class="max-w-[40ch] text-[26px] font-medium leading-[1.35] text-[#17200f] sm:text-[30px]"
			style="font-family: 'Fraunces', serif;"
		>
			The team writes postcards to itself. Literally — this is a running thread.
		</p>
	</div>

	<div class="postcard-track mt-14 flex gap-6 overflow-x-auto px-6 pb-8 sm:px-10 lg:px-14">
		{#each postcards as card, i (card._id)}
			<figure
				class="postcard relative shrink-0 overflow-hidden bg-white shadow-[0_18px_40px_-16px_rgba(16,24,9,0.35)]"
				style="--tilt: {i % 2 === 0 ? '-1.5deg' : '1.5deg'};"
			>
				<img
					src={urlFor(card.image).width(680).height(520).url()}
					alt={card.place}
					class="h-65 w-85 object-cover"
					loading="lazy"
				/>
				<figcaption class="border-t border-black/5 p-4">
					<p class="text-[13px] font-semibold text-[#17200f]">{card.place}</p>
					<p class="mt-1 text-[13px] leading-snug text-[#17200f]/60">{card.caption}</p>
				</figcaption>
			</figure>
		{/each}
	</div>
</section>

<!-- ============ HOW HIRING WORKS (real sequence) ============ -->
<section class="bg-white px-6 py-20 sm:px-10 sm:py-28 lg:px-14" use:reveal>
	<div class="reveal mx-auto grid max-w-295 gap-14 lg:grid-cols-[0.8fr_1.2fr]">
		<h2
			class="max-w-[16ch] text-[clamp(1.9rem,3.2vw,2.5rem)] font-medium leading-[1.15] text-[#17200f]"
			style="font-family: 'Fraunces', serif;"
		>
			How you'll actually join us
		</h2>

		<ol class="flex flex-col divide-y divide-black/10 border-t border-black/10">
			<li class="grid grid-cols-[2.5rem_1fr] gap-6 py-7 sm:grid-cols-[3rem_1fr]">
				<span class="text-sm text-[#17200f]/40">1</span>
				<div>
					<p class="text-base font-semibold text-[#17200f]">Send us something real</p>
					<p class="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#17200f]/65">
						A note about a place that changed how you see things, alongside your CV. We read these
						before the CV.
					</p>
				</div>
			</li>
			<li class="grid grid-cols-[2.5rem_1fr] gap-6 py-7 sm:grid-cols-[3rem_1fr]">
				<span class="text-sm text-[#17200f]/40">2</span>
				<div>
					<p class="text-base font-semibold text-[#17200f]">A conversation, not an interview</p>
					<p class="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#17200f]/65">
						Thirty minutes with someone who'd actually be your teammate. No trick questions, no case
						study on the spot.
					</p>
				</div>
			</li>
			<li class="grid grid-cols-[2.5rem_1fr] gap-6 py-7 sm:grid-cols-[3rem_1fr]">
				<span class="text-sm text-[#17200f]/40">3</span>
				<div>
					<p class="text-base font-semibold text-[#17200f]">A small, paid trial</p>
					<p class="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#17200f]/65">
						A real piece of work, scoped to a few days, done on your own time and compensated
						whether or not it leads anywhere.
					</p>
				</div>
			</li>
			<li class="grid grid-cols-[2.5rem_1fr] gap-6 py-7 sm:grid-cols-[3rem_1fr]">
				<span class="text-sm text-[#17200f]/40">4</span>
				<div>
					<p class="text-base font-semibold text-[#17200f]">An offer in plain terms</p>
					<p class="mt-2 max-w-[54ch] text-[15px] leading-relaxed text-[#17200f]/65">
						Clear scope, clear pay, clear start date — sent as a document you can actually read in
						one sitting.
					</p>
				</div>
			</li>
		</ol>
	</div>
</section>

<!-- ============ TEAM QUOTES ============ -->
<section class="bg-[#17200f] px-6 py-20 text-white sm:px-10 sm:py-28 lg:px-14" use:reveal>
	<div class="reveal mx-auto grid max-w-295 gap-12 lg:grid-cols-2 lg:gap-16">
		{#each quotes as q (q._id)}
			<figure class="flex flex-col">
				<Quote class="mb-5 h-6 w-6 text-[#F98315]" aria-hidden="true" />
				<blockquote
					class="max-w-[42ch] text-[19px] leading-relaxed text-white/90"
					style="font-family: 'Fraunces', serif; font-style: italic;"
				>
					{q.quote}
				</blockquote>
				<figcaption class="mt-6 flex items-center gap-3">
					{#if q.photo}
						<img
							src={urlFor(q.photo).width(80).height(80).url()}
							alt=""
							class="h-10 w-10 rounded-full object-cover"
						/>
					{/if}
					<span class="text-sm">
						<span class="font-semibold">{q.name}</span>
						<span class="text-white/50"> — {q.role}</span>
					</span>
				</figcaption>
			</figure>
		{/each}
	</div>
</section>

<!-- ============ FINAL CTA ============ -->
<section class="relative overflow-hidden  px-6 py-24 text-black sm:px-10 lg:px-14">
	<div
		class="pointer-events-none absolute inset-0"
		style="background: radial-gradient(70% 90% at 85% 20%, rgba(249,131,21,0.25), transparent 65%);"
		aria-hidden="true"
	></div>
	<div class="relative mx-auto flex max-w-225 flex-col items-start gap-8">
		<h2
			class="max-w-[18ch] text-[clamp(2rem,4vw,2.9rem)] font-medium leading-[1.1]"
			style="font-family: 'Fraunces', serif;"
		>
			The next trip on our calendar needs someone we haven't hired yet.
		</h2>
		<a
			href="mailto:support@giditour.com?subject=Application: [Your Name]"
			class="inline-flex items-center gap-2 rounded-full bg-[#F98315] px-7 py-3.5 text-sm font-semibold text-[#17200f] transition hover:bg-[#101809] hover:text-white"
		>
			Send us your note
			<Send class="h-4 w-4" aria-hidden="true" />
		</a>
	</div>
</section>

<!-- apply modal -->
{#if applyModalRole}
	<ApplyModal roleTitle={applyModalRole} onClose={() => (applyModalRole = null)} />
{/if}

<style>
	/* ---- One orchestrated hero entrance (not repeated elsewhere) ---- */
	.hero-line {
		opacity: 0;
		transform: translateY(14px);
		animation: rise 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
	}
	.hero-line--1 {
		animation-delay: 100ms;
	}
	.hero-line--2 {
		animation-delay: 250ms;
	}
	.hero-line--3 {
		animation-delay: 500ms;
	}
	.hero-line--4 {
		animation-delay: 700ms;
	}

	@keyframes rise {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.stamp-badge {
		opacity: 0;
		transform: scale(1.4) rotate(-8deg);
		animation: stampPress 420ms cubic-bezier(0.2, 0.8, 0.2, 1) 900ms forwards;
	}

	@keyframes stampPress {
		0% {
			opacity: 0;
			transform: scale(1.4) rotate(-8deg);
		}
		70% {
			opacity: 1;
			transform: scale(0.92) rotate(-8deg);
		}
		100% {
			opacity: 1;
			transform: scale(1) rotate(-8deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-line,
		.stamp-badge {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	/* ---- Scattered postcard track ---- */
	.postcard-track {
		scroll-snap-type: x proximity;
		scrollbar-width: none;
	}
	.postcard-track::-webkit-scrollbar {
		display: none;
	}
	.postcard {
		scroll-snap-align: start;
		transform: rotate(var(--tilt));
		transition: transform 300ms ease;
	}
	.postcard:hover {
		transform: rotate(0deg) translateY(-4px);
	}
</style>
