import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'storeProduct',
	title: 'Store Product',
	type: 'document',
	fields: [
		defineField({
			name: 'category',
			title: 'Category',
			type: 'string',
			options: {
				list: [
					{ title: 'Gidi Tour Magazine', value: 'magazine' },
					{ title: 'Travel Merchandise', value: 'merchandise' }
				],
				layout: 'radio'
			},
			validation: (Rule) => Rule.required()
		}),

		defineField({
			name: 'title',
			title: 'Title',
			type: 'string',
			validation: (Rule) => Rule.required()
		}),

		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'title', maxLength: 96 },
			validation: (Rule) => Rule.required()
		}),

		defineField({
			name: 'image',
			title: 'Product image',
			type: 'image',
			options: { hotspot: true },
			validation: (Rule) => Rule.required()
		}),

		defineField({
			name: 'description',
			title: 'Description',
			type: 'text',
			rows: 4,
			validation: (Rule) => Rule.required()
		}),

		defineField({
			name: 'price',
			title: 'Price (GBP)',
			type: 'number',
			validation: (Rule) => Rule.required().positive()
		}),

		defineField({
			name: 'popular',
			title: 'Featured / popular',
			type: 'boolean',
			initialValue: false
		}),

		// ---------- MAGAZINE-ONLY FIELDS ----------
		defineField({
			name: 'issueNumber',
			title: 'Issue number',
			type: 'string',
			hidden: ({ document }) => document?.category !== 'magazine'
		}),

		defineField({
			name: 'publishDate',
			title: 'Publish date',
			type: 'date',
			hidden: ({ document }) => document?.category !== 'magazine'
		}),

		defineField({
			name: 'digitalFile',
			title: 'Digital file (PDF)',
			description: 'The file a buyer gets permanent access to after purchase.',
			type: 'file',
			options: { accept: '.pdf' },
			hidden: ({ document }) => document?.category !== 'magazine',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const doc = context.document as { category?: string } | undefined;
					if (doc?.category === 'magazine' && !value) {
						return 'A digital file is required for magazine issues.';
					}
					return true;
				})
		}),

		// ---------- MERCHANDISE-ONLY FIELDS ----------
		defineField({
			name: 'sku',
			title: 'SKU',
			type: 'string',
			hidden: ({ document }) => document?.category !== 'merchandise'
		}),

		defineField({
			name: 'variants',
			title: 'Variants (e.g. size, colour)',
			description: 'Optional. Leave empty if the product has no variants.',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'variant',
					fields: [
						{ name: 'label', title: 'Label', type: 'string' },
						{ name: 'stock', title: 'Stock', type: 'number' }
					]
				}
			],
			hidden: ({ document }) => document?.category !== 'merchandise'
		}),

		defineField({
			name: 'stock',
			title: 'Stock (if no variants)',
			type: 'number',
			hidden: ({ document }) =>
				document?.category !== 'merchandise' ||
				Boolean((document as { variants?: unknown[] })?.variants?.length)
		})
	],

	preview: {
		select: {
			title: 'title',
			category: 'category',
			media: 'image'
		},
		prepare({ title, category, media }) {
			return {
				title,
				subtitle: category === 'magazine' ? 'Magazine issue' : 'Merchandise',
				media
			};
		}
	}
});