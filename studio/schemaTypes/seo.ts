import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'seo',
	title: 'SEO',
	type: 'object',
	fields: [
		defineField({
			name: 'metaTitle',
			title: 'Meta title',
			type: 'string',
			description: 'Shown in browser tabs and Google search results. Keep under 60 characters.'
		}),
		defineField({
			name: 'metaDescription',
			title: 'Meta description',
			type: 'text',
			description: 'Shown under the title in Google search results. Keep under 160 characters.'
		}),
		defineField({
			name: 'ogImage',
			title: 'Social share image',
			type: 'image',
			description: 'Shown when this page is shared on WhatsApp, Twitter, Facebook, etc.'
		})
	]
});