import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import Credentials from '@auth/sveltekit/providers/credentials';
import bcrypt from 'bcryptjs';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import { getCustomerByEmail, createCustomer } from '$lib/sanity/queries/customer';

export const { handle, signIn, signOut } = SvelteKitAuth({
	secret: AUTH_SECRET,
	trustHost: true,
	session: { strategy: 'jwt' },
	providers: [
		Google({ clientId: GOOGLE_CLIENT_ID, clientSecret: GOOGLE_CLIENT_SECRET }),
		Credentials({
			name: 'Email and password',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' }
			},
			async authorize(credentials) {
				const email = credentials?.email as string;
				const password = credentials?.password as string;
				if (!email || !password) return null;

				const customer = await getCustomerByEmail(email);
				if (!customer || !customer.passwordHash) return null;

				const valid = await bcrypt.compare(password, customer.passwordHash);
				if (!valid) return null;

				return { id: customer._id, email: customer.email, name: customer.name };
			}
		})
	],
	// STEP 6 lives here — creating/syncing the Sanity customer record
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider === 'google' && user.email) {
				const existing = await getCustomerByEmail(user.email);
				if (!existing) {
					const created = await createCustomer({
						name: user.name ?? undefined,
						email: user.email,
						provider: 'google'
					});
					user.id = created._id; // attach the Sanity ID immediately after creating
				} else {
					user.id = existing._id; // attach the existing customer's Sanity ID
				}
			}
			return true;
		},
		async jwt({ token, user }) {
			// `user` is only present on initial sign-in — persist the id into the token
			if (user?.id) {
				token.id = user.id;
			}
			return token;
		},
		async session({ session, token }) {
			// pull the id back out of the token into session.user, where your pages read it
			if (token?.id && session.user) {
				session.user.id = token.id as string;
			}
			return session;
		}
	},
	pages: {
		signIn: '/login'
	}
});
