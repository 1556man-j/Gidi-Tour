import { sanityClient } from '../client';

export interface SanityTrustpilotReview {
	_id: string;
	name: string;
	location?: string;
	rating: number;
	quote: string;
	avatar?: { asset: { _ref: string } };
	reviewUrl?: string;
	datePosted?: string;
}

export async function getTrustpilotReviews(): Promise<SanityTrustpilotReview[]> {
	return sanityClient.fetch(`*[_type == "trustpilotReview"] | order(order asc)`);
}