<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Page not found' : 'Something went wrong'} — Gidi Tour</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<section class="error-page flex min-h-[100vh] w-full items-center justify-center bg-[#f7f3ea] px-6 py-20 text-center">
	<div class="error-page__content max-w-lg">
		<p class="error-page__eyebrow mb-4 text-lg font-bold uppercase text-[#F98315]">
			Error {page.status}
		</p>

		<h1 class="error-page__heading font-display text-5xl leading-tight tracking-[-.02em] text-[#17200f] sm:text-6xl">
			{page.status === 404 ? "You've wandered off the map." : 'Something went wrong.'}
		</h1>

		<p class="error-page__copy mx-auto mt-6 max-w-md text-lg leading-relaxed text-[#17200f]/60">
			{page.error?.message ??
				(page.status === 404
					? "The page you're looking for doesn't exist, or it moved somewhere new."
					: "We hit a snag on our end. Give it another moment and try again.")}
		</p>

		<a
			href="/"
			class="error-page__cta mt-10 inline-flex items-center gap-2 rounded-full bg-[#5C9B19] px-8 py-4 text-base font-bold text-white shadow-md transition hover:scale-105 hover:shadow-lg"
		>
			Take me home
		</a>
	</div>
</section>

<style>
	.error-page__eyebrow,
	.error-page__heading,
	.error-page__copy,
	.error-page__cta {
		opacity: 0;
		animation: rise-in 700ms ease forwards;
	}

	.error-page__eyebrow {
		animation-delay: 60ms;
	}
	.error-page__heading {
		animation-delay: 160ms;
	}
	.error-page__copy {
		animation-delay: 280ms;
	}
	.error-page__cta {
		animation-delay: 420ms;
	}

	@keyframes rise-in {
		from {
			opacity: 0;
			transform: translateY(14px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* gentle idle float once everything has settled in, so the page
	   doesn't feel static — subtle enough not to distract from reading */
	.error-page__content {
		animation: float 5s ease-in-out 1.2s infinite;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-6px);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.error-page__eyebrow,
		.error-page__heading,
		.error-page__copy,
		.error-page__cta,
		.error-page__content {
			animation: none;
			opacity: 1;
		}
	}
</style>