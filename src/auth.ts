import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import Credentials from '@auth/sveltekit/providers/credentials';
import bcrypt from 'bcryptjs';
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, AUTH_SECRET } from '$env/static/private';
import {
	getCustomerByEmail,
	createCustomer,
	convertToGoogleAccount
} from '$lib/sanity/queries/customer';
import { isRateLimited, ipFromRequest } from '$lib/server/rateLimit';

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
			async authorize(credentials, request) {
				const email = credentials?.email as string;
				const password = credentials?.password as string;
				if (!email || !password) return null;

				// Slows down password guessing: per account and per visitor, 15 minutes.
				if (
					(await isRateLimited(`login-email:${email.trim().toLowerCase()}`, 10, 900)) ||
					(await isRateLimited(`login-ip:${ipFromRequest(request)}`, 30, 900))
				) {
					return null;
				}

				const customer = await getCustomerByEmail(email);
				if (!customer || !customer.passwordHash) return null;

				const valid = await bcrypt.compare(password, customer.passwordHash);
				if (!valid) return null;

				// Email must be confirmed first. The login page asks /api/auth/verification
				// to tell the person why, and offers to resend the link.
				if (!customer.emailVerified) return null;

				return { id: customer._id, email: customer.email, name: customer.name };
			}
		})
	],
	// STEP 6 lives here — creating/syncing the Sanity customer record
	callbacks: {
		async signIn({ user, account, profile }) {
			if (account?.provider === 'google') {
				// Only accept Google accounts whose email Google itself has verified.
				if (!user.email || profile?.email_verified !== true) return false;

				const existing = await getCustomerByEmail(user.email);

				if (!existing) {
					const created = await createCustomer({
						name: user.name ?? undefined,
						email: user.email,
						provider: 'google',
						emailVerified: true
					});
					user.id = created._id;
				} else {
					// An unconfirmed password account with this email may have been created by
					// someone else, so it is taken over by the real owner and its password removed.
					if (!existing.emailVerified) await convertToGoogleAccount(existing._id);
					user.id = existing._id;
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
