import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'tour',
	title: 'Tour',
	type: 'document',
	fields: [
		defineField({ name: 'title', title: 'Title', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'title' },
			validation: (r) => r.required()
		}),
		defineField({ name: 'country', title: 'Country name', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'countrySlug',
			title: 'Country slug',
			type: 'string',
			description: 'Must match a destination slug, e.g. "nigeria", "kenya".',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: ['City Break', 'Safari', 'Cultural', 'Coastal', 'Adventure', 'Art']
			}
		}),
		defineField({ name: 'image', title: 'Cover image', type: 'image', options: { hotspot: true } }),
		defineField({
			name: 'gallery',
			title: 'Gallery',
			type: 'array',
			of: [{ type: 'image', options: { hotspot: true } }]
		}),
		defineField({ name: 'duration', title: 'Duration', type: 'string' }),
		defineField({ name: 'groupSize', title: 'Group size', type: 'string' }),
		defineField({ name: 'price', title: 'Price per person (USD)', type: 'number', validation: (r) => r.required() }),
		defineField({ name: 'deposit', title: 'Deposit', type: 'number', validation: (r) => r.required() }),
		defineField({ name: 'rating', title: 'Rating', type: 'number' }),
		defineField({ name: 'reviewCount', title: 'Review count', type: 'number' }),
		defineField({ name: 'summary', title: 'Summary', type: 'text' }),
		defineField({ name: 'highlights', title: 'Highlights', type: 'array', of: [{ type: 'string' }] }),
		defineField({ name: 'includes', title: 'Includes', type: 'array', of: [{ type: 'string' }] }),
		defineField({ name: 'popular', title: 'Popular?', type: 'boolean' }),
		defineField({ name: 'seo', title: 'SEO', type: 'seo' })
	],
	preview: {
		select: { title: 'title', subtitle: 'country', media: 'image' }
	}
});