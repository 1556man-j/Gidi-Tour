import type { StoreProduct } from '$lib/sanity/queries/store';

/**
 * Returns a customer-friendly message if the requested quantity is not in stock, otherwise null.
 * Only merchandise is limited. A blank stock number in Sanity means "not tracked", so it never blocks a sale.
 */
export function stockProblem(product: StoreProduct, variant: string | undefined, quantity: number): string | null {
	if (product.category !== 'merchandise') return null;

	if (product.variants?.length) {
		const v = product.variants.find((x) => x.label === variant);
		if (!v) return `Please choose an option for ${product.title}.`;
		if (v.stock === undefined || v.stock === null) return null;
		if (v.stock <= 0) return `${product.title} (${v.label}) is sold out.`;
		if (quantity > v.stock) return `Only ${v.stock} of ${product.title} (${v.label}) left. Please lower the quantity.`;
		return null;
	}

	if (product.stock === undefined || product.stock === null) return null;
	if (product.stock <= 0) return `${product.title} is sold out.`;
	if (quantity > product.stock) return `Only ${product.stock} of ${product.title} left. Please lower the quantity.`;
	return null;
}
