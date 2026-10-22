import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),

		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},

			adapter: adapter(),

			// SvelteKit's built-in origin check is switched off here ('*' is the current
			// replacement for the deprecated checkOrigin: false).
			// src/hooks.server.ts does the same check itself, with exceptions for the
			// payment provider return and webhook routes.
			csrf: {
				trustedOrigins: ['*']
			},

			// Content Security Policy, now ENFORCED: browsers block anything not listed here.
			// If a new outside service is added to the site (analytics, video, a payment
			// method), add its address to the matching list below. Violations are logged
			// by /api/csp-report. To go back to warn-only mode, rename `directives` to
			// `reportOnly`.
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': [
						'self',
						'strict-dynamic',
						'https://js.stripe.com',
						'https://www.googletagmanager.com',
						'https://embed.tawk.to'
					],
					'style-src': [
						'self',
						'unsafe-inline',
						'https://fonts.googleapis.com',
						'https://*.tawk.to'
					],
					'font-src': ['self', 'data:', 'https://fonts.gstatic.com', 'https://*.tawk.to'],
					'img-src': [
						'self',
						'data:',
						'blob:',
						'https://cdn.sanity.io',
						'https://res.cloudinary.com',
						'https://images.unsplash.com',
						'https://*.stripe.com',
						'https://*.google-analytics.com',
						'https://www.googletagmanager.com',
						'https://*.tawk.to',
						'https://*.tawk.link'
					],
					'connect-src': [
						'self',
						'https://*.stripe.com',
						'https://*.stripe.network',
						'https://*.google-analytics.com',
						'https://*.analytics.google.com',
						'https://www.googletagmanager.com',
						'https://*.tawk.to',
						'wss://*.tawk.to'
					],
					'frame-src': [
						'self',
						'https://js.stripe.com',
						'https://*.js.stripe.com',
						'https://hooks.stripe.com',
						'https://*.stripe.network',
						'https://*.tawk.to'
					],
					'frame-ancestors': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self', 'https://accounts.google.com'],
					'report-uri': ['/api/csp-report']
				}
			}
		})
	]
});
