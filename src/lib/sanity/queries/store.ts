import { sanityClient } from '../client';

export interface StoreProductVariant {
	label: string;
	stock?: number;
}

export interface StoreProduct {
	_id: string;
	category: 'magazine' | 'merchandise';
	title: string;
	slug: { current: string };
	image: unknown; // Sanity image ref — pass through urlFor()
	description: string;
	price: number;
	popular?: boolean;
	// magazine
	isFree?: boolean;
	issueNumber?: string;
	publishDate?: string;
	digitalFile?: { asset: { _ref: string } };
	// merchandise
	sku?: string;
	variants?: StoreProductVariant[];
	stock?: number;
}

const STORE_PRODUCTS_QUERY = /* groq */ `
	*[_type == "storeProduct"] | order(category asc, title asc) {
		_id,
		category,
		title,
		slug,
		image,
		description,
		price,
		popular,
		isFree,
		issueNumber,
		publishDate,
		digitalFile,
		sku,
		variants,
		stock
	}
`;

export async function getStoreProducts(): Promise<StoreProduct[]> {
	return sanityClient.fetch(STORE_PRODUCTS_QUERY);
}