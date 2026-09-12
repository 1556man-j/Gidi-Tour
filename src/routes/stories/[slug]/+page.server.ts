import { error } from '@sveltejs/kit';
import { getArticleBySlug, getRelatedArticles } from '$lib/sanity/queries/articles';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const article = await getArticleBySlug(params.slug);

	if (!article) {
		throw error(404, 'Article not found');
	}

	const related = await getRelatedArticles(article);

	return { article, related };
};