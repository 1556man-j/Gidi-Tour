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

	async function handleSubmit() {
		if (!stripe || !elements) {
			onError('Payment form is not ready yet.');
			return;
		}

		submitting = true;
		onError('');

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/book/confirmation`
				},
				redirect: 'if_required'
			});

			// --------------------------------------------------
			// STRIPE PAYMENT FAILED
			// --------------------------------------------------

			if (error) {
				console.error('Stripe payment failed:', error);
				onError(error.message ?? 'Payment failed.');
				return;
			}

			console.log('Stripe payment completed:', paymentIntent?.id);
			console.log('Stripe payment status:', paymentIntent?.status);

			// --------------------------------------------------
			// NO PAYMENT INTENT
			// --------------------------------------------------

			if (!paymentIntent) {
				onError(
					'We could not confirm the payment status. Please do not pay again. Check your email shortly or contact Gidi Tour.'
				);
				return;
			}

			// --------------------------------------------------
			// PAYMENT NOT COMPLETED
			// --------------------------------------------------

			if (paymentIntent.status !== 'succeeded') {
				console.log(
					`Stripe PaymentIntent is not succeeded yet: ${paymentIntent.status}`
				);

				onError(
					'Your payment is still being processed. Please do not pay again. Check your email shortly for confirmation.'
				);
				return;
			}

			// --------------------------------------------------
			// PAYMENT SUCCESSFUL
			// --------------------------------------------------

			console.log('Stripe payment succeeded:', paymentIntent.id);

			/*
			 * Stripe has confirmed the payment.
			 *
			 * The webhook independently handles:
			 *
			 * Stripe
			 *   ↓
			 * payment_intent.succeeded
			 *   ↓
			 * Sanity booking = paid
			 *   ↓
			 * Confirmation email
			 *
			 * We do NOT make the customer wait for that process.
			 */

			onSuccess();
		} catch (error) {
			console.error('Stripe payment error:', error);

			onError(
				'Your payment may have been successful. Please do not pay again. Check your email shortly or contact Gidi Tour.'
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
	{submitting ? 'Confirming your payment…' : 'Pay now'}
</button>