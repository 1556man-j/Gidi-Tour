import { sanityClient } from '../client';
import { sanityWriteClient } from '../serverClient';

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
