<script lang="ts">
	import { onMount } from 'svelte';
	import { loadStripe, type Stripe, type StripeElements } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';

	interface Props {
		clientSecret: string;
		bookingId: string;
		onSuccess: () => void;
		onError: (msg: string) => void;
	}

	let { clientSecret, bookingId, onSuccess, onError }: Props = $props();

	let stripe: Stripe | null = $state(null);
	let elements: StripeElements | null = $state(null);
	let paymentElementContainer: HTMLDivElement | undefined;
	let submitting = $state(false);

	onMount(async () => {
		try {
			stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);

			if (!stripe || !paymentElementContainer) {
				onError('Could not load the payment form.');
				return;
			}

			elements = stripe.elements({
				clientSecret
			});

			const paymentElement = elements.create('payment');

			paymentElement.mount(paymentElementContainer);
		} catch (error) {
			console.error('Stripe initialization error:', error);
			onError('Could not load the payment form.');
		}
	});

	async function waitForBookingConfirmation(): Promise<boolean> {
		const maxAttempts = 15;
		const delay = 1000;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				const response = await fetch(`/api/book/status/${encodeURIComponent(bookingId)}`);

				if (response.ok) {
					const data = await response.json();

					if (data.paymentStatus === 'paid') {
						return true;
					}
				}
			} catch (error) {
				console.error('Booking status check failed:', error);
			}

			await new Promise((resolve) => setTimeout(resolve, delay));
		}

		return false;
	}

	async function handleSubmit() {
		if (!stripe || !elements) {
			onError('Payment form is not ready yet.');
			return;
		}

		submitting = true;

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/book/confirmation`
				},
				redirect: 'if_required'
			});

			if (error) {
				onError(error.message ?? 'Payment failed.');
				return;
			}

			console.log('Stripe payment completed:', paymentIntent?.id);

			// Wait for our server-side webhook to update Sanity.
			const confirmed = await waitForBookingConfirmation();

			if (!confirmed) {
				onError(
					'Your payment was received, but we are still confirming your booking. Please do not pay again. Check your email shortly or contact Gidi Tour.'
				);
				return;
			}

			onSuccess();
		} catch (error) {
			console.error('Stripe payment error:', error);

			onError(
				'Something went wrong while confirming your payment. Please try again or contact Gidi Tour.'
			);
		} finally {
			submitting = false;
		}
	}
</script>

<div bind:this={paymentElementContainer} class="mb-4"></div>

<button
	type="button"
	onclick={handleSubmit}
	disabled={submitting}
	class="w-full rounded-full bg-[#5C9B19] px-6 py-3.5 text-sm font-bold text-white transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
>
	{submitting ? 'Confirming your booking…' : 'Pay now'}
</button>
