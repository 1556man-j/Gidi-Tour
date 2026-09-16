import { sanityClient } from '../client';

export interface SanityJobPosition {
	_id: string;
	title: string;
	slug: { current: string };
	team?: string;
	location?: string;
	commitment?: string;
	summary: string;
	isOpen?: boolean;
}

export interface SanityPostcard {
	_id: string;
	image: { asset: { _ref: string } };
	place: string;
	caption?: string;
}

export interface SanityTeamQuote {
	_id: string;
	quote: string;
	name: string;
	role?: string;
	photo?: { asset: { _ref: string } };
}

export async function getOpenPositions(): Promise<SanityJobPosition[]> {
	return sanityClient.fetch(`*[_type == "jobPosition" && isOpen == true] | order(order asc)`);
}

export async function getPostcards(): Promise<SanityPostcard[]> {
	return sanityClient.fetch(`*[_type == "postcard"] | order(order asc)`);
}

export async function getTeamQuotes(): Promise<SanityTeamQuote[]> {
	return sanityClient.fetch(`*[_type == "teamQuote"] | order(order asc)`);
}