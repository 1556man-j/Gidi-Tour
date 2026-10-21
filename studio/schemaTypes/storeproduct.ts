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
			name: 'gallery',
			title: 'Extra photos (gallery)',
			description:
				'Optional. Add more photos of the product, or inside pages for a magazine. Shown under the main image on the product page.',
			type: 'array',
			of: [
				{
					type: 'image',
					options: { hotspot: true },
					fields: [{ name: 'alt', title: 'Short description of the photo', type: 'string' }]
				}
			]
		}),

		defineField({
			name: 'highlights',
			title: 'Highlights',
			description: 'Optional short bullet points, for example "100% cotton" or "48 pages of city guides".',
			type: 'array',
			of: [{ type: 'string' }]
		}),

		defineField({
			name: 'details',
			title: 'Full product details',
			description: 'Optional longer write-up shown on the product page.',
			type: 'array',
			of: [
				{
					type: 'block',
					styles: [
						{ title: 'Normal', value: 'normal' },
						{ title: 'Subheading', value: 'h3' },
						{ title: 'Quote', value: 'blockquote' }
					],
					lists: [],
					marks: {
						decorators: [
							{ title: 'Bold', value: 'strong' },
							{ title: 'Italic', value: 'em' }
						]
					}
				}
			]
		}),

		defineField({
			name: 'specs',
			title: 'Specifications',
			description: 'Optional facts shown as a table, for example Size: A4, Pages: 48, Material: Canvas.',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'spec',
					fields: [
						{ name: 'label', title: 'Label', type: 'string' },
						{ name: 'value', title: 'Value', type: 'string' }
					],
					preview: { select: { title: 'label', subtitle: 'value' } }
				}
			]
		}),

		// ---------- FREE OR PAID (magazines only) ----------
		defineField({
			name: 'isFree',
			title: 'Free magazine',
			description:
				'Turn on to give this issue away for free. Buyers only enter their name and email and get the download link. Turn off to sell it at the price below.',
			type: 'boolean',
			initialValue: false,
			hidden: ({ document }) => document?.category !== 'magazine'
		}),

		defineField({
			name: 'price',
			title: 'Price (GBP)',
			type: 'number',
			hidden: ({ document }) => Boolean((document as { isFree?: boolean })?.isFree),
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const doc = context.document as { isFree?: boolean; category?: string } | undefined;

					// Free magazines don't need a price.
					if (doc?.category === 'magazine' && doc?.isFree) return true;

					if (value === undefined || value === null) {
						return 'A price is required unless this magazine is free.';
					}
					if (value <= 0) return 'Price must be greater than zero.';
					return true;
				})
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
			name: 'storagePath',
			title: 'File name in private storage',
			description:
				'The exact file name of the PDF you uploaded to the private "magazines" bucket in Supabase Storage, for example issue-01.pdf. Buyers get access after purchase.',
			type: 'string',
			hidden: ({ document }) => document?.category !== 'magazine',
			validation: (Rule) =>
				Rule.custom((value, context) => {
					const doc = context.document as { category?: string; isFree?: boolean } | undefined;
					if (doc?.category === 'magazine' && !value) {
						return 'A file name is required for magazine issues.';
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
			isFree: 'isFree',
			media: 'image'
		},
		prepare({ title, category, isFree, media }) {
			return {
				title,
				subtitle:
					category === 'magazine'
						? isFree
							? 'Magazine issue · Free'
							: 'Magazine issue · Paid'
						: 'Merchandise',
				media
			};
		}
	}
});