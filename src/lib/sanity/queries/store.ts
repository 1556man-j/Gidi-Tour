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
	// merchandise
	sku?: string;
	variants?: StoreProductVariant[];
	stock?: number;
}

export interface StoreProductDetail extends StoreProduct {
	gallery?: { _key?: string; alt?: string; asset: { _ref: string } }[];
	highlights?: string[];
	details?: unknown[]; // portable text
	specs?: { _key?: string; label?: string; value?: string }[];
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
		sku,
		variants,
		stock
	}
`;

export async function getStoreProducts(): Promise<StoreProduct[]> {
	return sanityClient.fetch(STORE_PRODUCTS_QUERY);
}

const STORE_PRODUCT_BY_SLUG_QUERY = /* groq */ `
	*[_type == "storeProduct" && slug.current == $slug][0] {
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
		sku,
		variants,
		stock,
		gallery,
		highlights,
		details,
		specs
	}
`;

export async function getStoreProductBySlug(slug: string): Promise<StoreProductDetail | null> {
	return sanityClient.fetch(STORE_PRODUCT_BY_SLUG_QUERY, { slug });
}
