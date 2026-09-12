import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'article',
	title: 'Story',
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
		defineField({ name: 'image', title: 'Cover image', type: 'image', options: { hotspot: true } }),
		defineField({ name: 'excerpt', title: 'Excerpt', type: 'text', validation: (r) => r.required() }),
		defineField({
			name: 'body',
			title: 'Body',
			description: 'Write the article here — use headings to break it into sections.',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{ title: 'Normal', value: 'normal' },
						{ title: 'Section Heading', value: 'h2' },
						{ title: 'Subheading', value: 'h3' },
						{ title: 'Quote', value: 'blockquote' }
					],
					marks: {
						decorators: [
							{ title: 'Bold', value: 'strong' },
							{ title: 'Italic', value: 'em' }
						]
					}
				},
				{ type: 'image', options: { hotspot: true } }
			]
		}),
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: { list: ['Guide', 'Food', 'Culture', 'Tips', 'Story'] },
			validation: (r) => r.required()
		}),
		defineField({ name: 'destination', title: 'Destination (display text)', type: 'string' }),
		defineField({ name: 'readTime', title: 'Read time (minutes)', type: 'number' }),
		defineField({ name: 'date', title: 'Published date', type: 'datetime', validation: (r) => r.required() }),
		defineField({ name: 'featured', title: 'Featured on journal homepage?', type: 'boolean' }),
		defineField({ name: 'seo', title: 'SEO', type: 'seo' })
	],
	preview: {
		select: { title: 'title', subtitle: 'category', media: 'image' }
	}
});