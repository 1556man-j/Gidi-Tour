import { sanityClient } from '../client';
import { sanityWriteClient } from '../serverClient';
import crypto from 'node:crypto';

export interface SanityCustomer {
	_id: string;
	name?: string;
	email: string;
	passwordHash?: string;
	provider?: string;
}

export async function getCustomerByEmail(email: string): Promise<SanityCustomer | null> {
	return sanityClient.fetch(`*[_type == "customer" && email == $email][0]`, { email });
}

export async function createCustomer(input: {
	name?: string;
	email: string;
	passwordHash?: string;
	provider: 'credentials' | 'google';
	nationality?: string;
	phoneDialCode?: string;
	phoneNumber?: string;
}) {
	return sanityWriteClient.create({
		_type: 'customer',
		...input,
		createdAt: new Date().toISOString()
	});
}

// Explicit projection: passwordHash is deliberately NOT listed here.
const SAFE_PROFILE_FIELDS = `
	_id, name, email, provider, nationality, dateOfBirth,
	phoneDialCode, phoneNumber, address, emergencyContact, travelNotes, avatar
`;

export async function getCustomerProfile(id: string) {
	// Write client = no CDN, so edits show up immediately. Server-only.
	return sanityWriteClient.fetch(
		`*[_type == "customer" && _id == $id][0]{ ${SAFE_PROFILE_FIELDS} }`,
		{ id }
	);
}
export async function setPasswordResetToken(
	customerId: string,
	tokenHash: string,
	expiresAt: string
) {
	return sanityWriteClient
		.patch(customerId)
		.set({
			passwordResetToken: tokenHash,
			passwordResetExpires: expiresAt
		})
		.commit();
}

export async function getCustomerByResetToken(tokenHash: string) {
	return sanityClient.fetch(
		`*[
			_type == "customer" &&
			passwordResetToken == $tokenHash &&
			passwordResetExpires > $now
		][0]`,
		{
			tokenHash,
			now: new Date().toISOString()
		}
	);
}

export async function updateCustomerPassword(
	customerId: string,
	passwordHash: string
) {
	return sanityWriteClient
		.patch(customerId)
		.set({
			passwordHash
		})
		.unset(['passwordResetToken', 'passwordResetExpires'])
		.commit();
}