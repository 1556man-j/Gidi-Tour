import { sanityClient } from '../client';

export interface SanityFaq {
	_id: string;
	question: string;
	answer: string;
	page?: string;
	order?: number;
}

export async function getFaqsForPage(page: string): Promise<SanityFaq[]> {
	return sanityClient.fetch(
		`*[_type == "faq" && (page == $page || page == "general")] | order(order asc)`,
		{ page }
	);
}