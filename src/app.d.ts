import type { DefaultSession } from '@auth/sveltekit';

declare global {
	interface Window {
		dataLayer: unknown[][];
		gtag: (...args: unknown[]) => void;
	}
}

declare module '@auth/sveltekit' {
	interface Session {
		user?: {
			id?: string;
		} & DefaultSession['user'];
	}
}


export {};