import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'destination',
	title: 'Destination',
	type: 'document',
	fields: [
		defineField({ name: 'name', title: 'Country name', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'name' },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'region',
			title: 'Region',
			type: 'string',
			options: {
				list: ['West Africa', 'East Africa', 'North Africa', 'Southern Africa', 'Europe']
			}
		}),
		defineField({ name: 'heroImage', title: 'Hero image', type: 'image', options: { hotspot: true } }),
		defineField({ name: 'intro', title: 'Intro paragraph', type: 'text' }),
		defineField({ name: 'bestTime', title: 'Best time to visit', type: 'string' }),
		defineField({ name: 'duration', title: 'Typical duration', type: 'string' }),
		defineField({ name: 'priceFrom', title: 'Price from (display string)', type: 'string' }),
		defineField({
			name: 'cities',
			title: 'Cities',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'city',
					fields: [
						{ name: 'name', type: 'string' },
						{ name: 'blurb', type: 'string' },
						{ name: 'image', type: 'image', options: { hotspot: true } },
						{ name: 'gallery', type: 'array', of: [{ type: 'image', options: { hotspot: true } }] }
					]
				}
			]
		}),
		defineField({ name: 'thingsToDo', title: 'Things to do', type: 'array', of: [{ type: 'string' }] }),
		defineField({
			name: 'experiences',
			title: 'Featured experiences',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'experience',
					fields: [
						{ name: 'title', type: 'string' },
						{ name: 'blurb', type: 'string' },
						{ name: 'image', type: 'image', options: { hotspot: true } },
						{ name: 'tour', title: 'Linked tour', type: 'reference', to: [{ type: 'tour' }] },
						{ name: 'href', title: 'Fallback link (if no tour)', type: 'string' }
					]
				}
			]
		}),
		defineField({
			name: 'food',
			title: 'Food & culture',
			type: 'array',
			of: [
				{
					type: 'object',
					name: 'dish',
					fields: [
						{ name: 'name', type: 'string' },
						{ name: 'desc', type: 'text' }
					]
				}
			]
		}),
		defineField({ name: 'travelTips', title: 'Travel tips', type: 'array', of: [{ type: 'string' }] }),
		defineField({ name: 'seo', title: 'SEO', type: 'seo' })
	],
	preview: {
		select: { title: 'name', subtitle: 'region', media: 'heroImage' }
	}
});