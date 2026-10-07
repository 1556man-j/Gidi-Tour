export interface PricedProduct {
	category: string;
	price?: number | null;
	isFree?: boolean | null;
}

// Only magazines can be free.
export function isFreeProduct(product: Pick<PricedProduct, 'category' | 'isFree'>): boolean {
	return product.category === 'magazine' && product.isFree === true;
}

// What the customer actually pays for one unit, in GBP.
export function effectivePrice(product: PricedProduct): number {
	return isFreeProduct(product) ? 0 : Number(product.price ?? 0);
}