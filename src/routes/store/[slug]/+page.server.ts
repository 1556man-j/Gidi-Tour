import { error } from '@sveltejs/kit';
import { getStoreProductBySlug, getStoreProducts } from '$lib/sanity/queries/store';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const product = await getStoreProductBySlug(params.slug);

	if (!product) {
		throw error(404, 'Product not found.');
	}

	// "You might also like": same category first, then anything else, up to 3.
	const all = await getStoreProducts();

	const related = all
		.filter((p) => p._id !== product._id)
		.sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category))
		.slice(0, 3);

	return { product, related };
};
