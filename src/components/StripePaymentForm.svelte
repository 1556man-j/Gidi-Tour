<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		loadStripe,
		type Stripe,
		type StripeElements,
		type StripePaymentElement
	} from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	import { Lock, ShieldCheck } from 'lucide-svelte';

	interface Props {
		clientSecret: string;
		bookingId: string;
		onSuccess: () => void;
		onError: (msg: string) => void;
		// Optional, e.g. "£45.00". Shows the amount on the pay button.
		amountLabel?: string;
		// Where PayPal (and 3D Secure) send the customer back to.
		// Defaults to the tour booking confirmation page.
		returnPath?: string;
	}

	let {
		clientSecret,
		bookingId,
		onSuccess,
		onError,
		amountLabel = '',
		returnPath
	}: Props = $props();

	let stripe: Stripe | null = $state(null);
	let elements: StripeElements | null = $state(null);
	let paymentElementContainer: HTMLDivElement | undefined;
	let paymentElement: StripePaymentElement | null = null;
	let submitting = $state(false);
	let ready = $state(false);

	const appearance = {
		theme: 'stripe' as const,
		variables: {
			colorPrimary: '#5C9B19',
			colorBackground: '#ffffff',
			colorText: '#17200f',
			colorTextSecondary: 'rgba(23,32,15,0.6)',
			colorTextPlaceholder: 'rgba(23,32,15,0.35)',
			colorDanger: '#F98315',
			fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
			fontSizeBase: '15px',
			borderRadius: '16px',
			spacingUnit: '4px',
			spacingGridRow: '16px'
		},
		rules: {
			'.Input': {
				border: '1.5px solid rgba(0,0,0,0.1)',
				padding: '14px 16px',
				boxShadow: 'none',
				transition: 'border-color 0.2s, box-shadow 0.2s'
			},
			'.Input:hover': {
				border: '1.5px solid rgba(0,0,0,0.2)'
			},
			'.Input:focus': {
				border: '1.5px solid #5C9B19',
				boxShadow: '0 0 0 4px rgba(92,155,25,0.15)'
			},
			'.Input--invalid': {
				border: '1.5px solid #F98315',
				boxShadow: '0 0 0 4px rgba(249,131,21,0.12)'
			},
			'.Label': {
				fontSize: '12px',
				fontWeight: '600',
				letterSpacing: '0.02em',
				color: 'rgba(23,32,15,0.6)'
			},
			'.AccordionItem': {
				border: '1.5px solid rgba(0,0,0,0.1)',
				boxShadow: 'none',
				padding: '16px'
			},
			'.AccordionItem--selected': {
				border: '1.5px solid #5C9B19',
				backgroundColor: 'rgba(92,155,25,0.04)',
				boxShadow: '0 6px 20px rgba(92,155,25,0.12)'
			},
			'.Error': {
				fontSize: '13px'
			}
		}
	};

	onMount(async () => {
		try {
			stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);

			if (!stripe || !paymentElementContainer) {
				onError('Could not load the payment form.');
				return;
			}

			elements = stripe.elements({ clientSecret, appearance });

			paymentElement = elements.create('payment', {
				layout: 'accordion',
				wallets: { applePay: 'auto', googlePay: 'auto' }
			});

			paymentElement.on('ready', () => {
				ready = true;
			});

			paymentElement.mount(paymentElementContainer);
		} catch (error) {
			console.error('Stripe initialization error:', error);
			onError('Could not load the payment form.');
		}
	});

	onDestroy(() => {
		paymentElement?.destroy();
	});

	async function handleSubmit() {
		if (!stripe || !elements) {
			onError('Payment form is not ready yet.');
			return;
		}

		submitting = true;
		onError('');

		const path = returnPath ?? `/book/confirmation?bookingId=${encodeURIComponent(bookingId)}`;

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}${path}`
				},
				redirect: 'if_required'
			});

			// STRIPE PAYMENT FAILED
			if (error) {
				console.error('Stripe payment failed:', error);
				onError(error.message ?? 'Payment failed.');
				return;
			}

			// NO PAYMENT INTENT
			if (!paymentIntent) {
				onError(
					'We could not confirm the payment status. Please do not pay again. Check your email shortly or contact Gidi Tour.'
				);
				return;
			}

			// PAYMENT NOT COMPLETED
			if (paymentIntent.status !== 'succeeded') {
				onError(
					'Your payment is still being processed. Please do not pay again. Check your email shortly for confirmation.'
				);
				return;
			}

			// PAYMENT SUCCESSFUL
			// The webhook saves the order as paid and sends the email,
			// so the customer does not wait for that.
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

<div class="flex flex-col gap-5">
	<!-- LOADING PLACEHOLDER (hidden once Stripe is ready) -->
	{#if !ready}
		<div class="flex animate-pulse flex-col gap-3" aria-hidden="true">
			<div class="h-14 rounded-2xl bg-black/5"></div>
			<div class="h-14 rounded-2xl bg-black/5"></div>
			<div class="h-14 rounded-2xl bg-black/5"></div>
		</div>
	{/if}

	<!-- STRIPE PAYMENT FORM -->
	<div bind:this={paymentElementContainer} class={ready ? 'block' : 'hidden'}></div>

	<!-- PAY BUTTON -->
	<button
		type="button"
		onclick={handleSubmit}
		disabled={submitting || !ready}
		class="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-b from-[#6aae26] to-[#5C9B19] px-6 py-4 text-[15px] font-bold text-white shadow-[0_10px_30px_-8px_rgba(92,155,25,0.65)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_36px_-8px_rgba(92,155,25,0.75)] active:translate-y-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
	>
		<Lock class="h-4 w-4" aria-hidden="true" />
		{#if submitting}
			Confirming your payment…
		{:else if amountLabel}
			Pay {amountLabel}
		{:else}
			Pay now
		{/if}
	</button>

	<!-- TRUST ROW -->
	<div
		class="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-[#17200f]/50"
	>
		<span class="inline-flex items-center gap-1.5">
			<ShieldCheck class="h-3.5 w-3.5 text-[#5C9B19]" aria-hidden="true" />
			Secure, encrypted payment
		</span>
		<span>Powered by Stripe</span>
	</div>
</div>