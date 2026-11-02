import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
	name: 'gidicareCase',
	title: 'GidiCare: Animal in need',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Name or headline',
			description: 'For example "Bruno the injured street dog".',
			type: 'string',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'title' },
			validation: (r) => r.required()
		}),
		defineField({
			name: 'status',
			title: 'Status',
			type: 'string',
			options: {
				layout: 'radio',
				list: [
					{ title: 'Needs help now (accepts donations)', value: 'active' },
					{ title: 'Fully funded (closed to donations)', value: 'funded' },
					{ title: 'Recovered or rehomed', value: 'recovered' }
				]
			},
			initialValue: 'active',
			validation: (r) => r.required()
		}),
		defineField({
			name: 'animalType',
			title: 'Animal',
			type: 'string',
			options: {
				layout: 'radio',
				list: [
					{ title: 'Dog', value: 'dog' },
					{ title: 'Cat', value: 'cat' },
					{ title: 'Other', value: 'other' }
				]
			}
		}),
		defineField({ name: 'location', title: 'Where (city, country)', type: 'string' }),
		defineField({
			name: 'partnerName',
			title: 'Vet or shelter caring for the animal',
			description: 'Optional. Shown on the page, for transparency.',
			type: 'string'
		}),
		defineField({
			name: 'photo',
			title: 'Main photo',
			type: 'image',
			options: { hotspot: true },
			fields: [{ name: 'alt', title: 'Short description of the photo', type: 'string' }],
			validation: (r) => r.required()
		}),
		defineField({
			name: 'summary',
			title: 'Short summary',
			description: 'One or two sentences shown on the card.',
			type: 'text',
			rows: 3,
			validation: (r) => r.required().max(240)
		}),
		defineField({
			name: 'story',
			title: 'Full story',
			type: 'array',
			of: [
				defineArrayMember({
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
				})
			]
		}),
		defineField({
			name: 'gallery',
			title: 'More photos',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'image',
					options: { hotspot: true },
					fields: [{ name: 'alt', title: 'Short description of the photo', type: 'string' }]
				})
			]
		}),
		defineField({
			name: 'goalGBP',
			title: 'Funding goal (in pounds, £)',
			description: 'How much this animal needs in total. Leave empty to hide the progress bar.',
			type: 'number',
			validation: (r) => r.min(1)
		}),
		defineField({
			name: 'raisedOffsetGBP',
			title: 'Money raised outside the website (in pounds, £)',
			description:
				'Optional. Cash or bank transfers received elsewhere. It is added to the donations made on the site in the progress bar.',
			type: 'number',
			initialValue: 0,
			validation: (r) => r.min(0)
		}),
		defineField({
			name: 'updates',
			title: 'Updates',
			description: 'Progress updates for supporters. Newest first.',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'update',
					fields: [
						{ name: 'date', title: 'Date', type: 'date' },
						{ name: 'text', title: 'Update', type: 'text', rows: 3 },
						{
							name: 'image',
							title: 'Photo (optional)',
							type: 'image',
							options: { hotspot: true }
						}
					],
					preview: { select: { title: 'text', subtitle: 'date', media: 'image' } }
				})
			]
		})
	],
	preview: { select: { title: 'title', subtitle: 'status', media: 'photo' } }
});
