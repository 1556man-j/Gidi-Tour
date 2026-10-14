import { db, unwrap, fromRow } from '$lib/server/supabase';

export interface SanityCustomer {
	_id: string;
	name?: string;
	email: string;
	passwordHash?: string;
	provider?: string;
	emailVerified?: boolean;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function getCustomerByEmail(email: string): Promise<SanityCustomer | null> {
	const row = unwrap(
		await db
			.from('customers')
			.select('id, name, email, password_hash, provider, email_verified')
			.eq('email', normalizeEmail(email))
			.maybeSingle()
	);

	if (!row) return null;

	return {
		_id: row.id,
		name: row.name ?? undefined,
		email: row.email,
		passwordHash: row.password_hash ?? undefined,
		provider: row.provider ?? undefined,
		emailVerified: row.email_verified ?? false
	};
}

export async function createCustomer(input: {
	name?: string;
	email: string;
	passwordHash?: string;
	provider: 'credentials' | 'google';
	emailVerified?: boolean;
	nationality?: string;
	phoneDialCode?: string;
	phoneNumber?: string;
}) {
	const row = unwrap(
		await db
			.from('customers')
			.insert({
				name: input.name ?? null,
				email: normalizeEmail(input.email),
				password_hash: input.passwordHash ?? null,
				provider: input.provider,
				email_verified: input.emailVerified ?? false,
				nationality: input.nationality ?? null,
				phone_dial_code: input.phoneDialCode ?? null,
				phone_number: input.phoneNumber ?? null
			})
			.select('id')
			.single()
	);

	return { _id: row.id as string };
}

// Explicit column list: password_hash is deliberately NOT included.
const SAFE_PROFILE_COLUMNS =
	'id, name, email, provider, nationality, date_of_birth, phone_dial_code, phone_number, address, emergency_contact, travel_notes, avatar_url';

export async function getCustomerProfile(id: string) {
	const row = unwrap(
		await db.from('customers').select(SAFE_PROFILE_COLUMNS).eq('id', id).maybeSingle()
	);

	return fromRow(row);
}

export async function updateCustomerProfile(
	id: string,
	fields: {
		name: string;
		nationality: string;
		dateOfBirth?: string;
		phoneDialCode: string;
		phoneNumber: string;
		address: Record<string, string>;
		emergencyContact: Record<string, string>;
		travelNotes: string;
	}
) {
	unwrap(
		await db
			.from('customers')
			.update({
				name: fields.name,
				nationality: fields.nationality,
				date_of_birth: fields.dateOfBirth || null,
				phone_dial_code: fields.phoneDialCode,
				phone_number: fields.phoneNumber,
				address: fields.address,
				emergency_contact: fields.emergencyContact,
				travel_notes: fields.travelNotes
			})
			.eq('id', id)
	);
}

export async function setCustomerAvatar(id: string, avatarUrl: string | null) {
	unwrap(await db.from('customers').update({ avatar_url: avatarUrl }).eq('id', id));
}

export async function setPasswordResetToken(
	customerId: string,
	tokenHash: string,
	expiresAt: string
) {
	unwrap(
		await db
			.from('customers')
			.update({ password_reset_token: tokenHash, password_reset_expires: expiresAt })
			.eq('id', customerId)
	);
}

export async function getCustomerByResetToken(tokenHash: string) {
	const row = unwrap(
		await db
			.from('customers')
			.select('id, name, email')
			.eq('password_reset_token', tokenHash)
			.gt('password_reset_expires', new Date().toISOString())
			.maybeSingle()
	);

	return row ? { _id: row.id as string, name: row.name, email: row.email as string } : null;
}

export async function updateCustomerPassword(customerId: string, passwordHash: string) {
	unwrap(
		await db
			.from('customers')
			.update({
				password_hash: passwordHash,
				// Resetting a password needs the emailed link, which proves the person owns the address.
				email_verified: true,
				password_reset_token: null,
				password_reset_expires: null
			})
			.eq('id', customerId)
	);
}

// ---------------------------------------------------------------------------
// Email confirmation
// ---------------------------------------------------------------------------

export async function setVerifyToken(customerId: string, tokenHash: string, expiresAt: string) {
	unwrap(
		await db
			.from('customers')
			.update({ verify_token_hash: tokenHash, verify_token_expires: expiresAt })
			.eq('id', customerId)
	);
}

/** Checks a confirmation link without using it up. */
export async function isVerifyTokenValid(tokenHash: string): Promise<boolean> {
	const row = unwrap(
		await db
			.from('customers')
			.select('id')
			.eq('verify_token_hash', tokenHash)
			.gt('verify_token_expires', new Date().toISOString())
			.maybeSingle()
	);

	return !!row;
}

/** Confirms the email behind a valid link. Returns false if the link is wrong or expired. */
export async function verifyEmailByToken(tokenHash: string): Promise<boolean> {
	const rows = unwrap(
		await db
			.from('customers')
			.update({ email_verified: true, verify_token_hash: null, verify_token_expires: null })
			.eq('verify_token_hash', tokenHash)
			.gt('verify_token_expires', new Date().toISOString())
			.select('id')
	);

	return (rows?.length ?? 0) > 0;
}

/**
 * Someone signed in with Google using an email that already has an UNCONFIRMED
 * password account. Google has proven they own the address, so the account is
 * confirmed, and the old password is removed in case a stranger set it before.
 */
export async function convertToGoogleAccount(customerId: string) {
	unwrap(
		await db
			.from('customers')
			.update({
				provider: 'google',
				password_hash: null,
				email_verified: true,
				verify_token_hash: null,
				verify_token_expires: null
			})
			.eq('id', customerId)
	);
}
