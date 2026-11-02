import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
	name: 'gidicareSettings',
	title: 'GidiCare: Page settings',
	type: 'document',
	fields: [
		defineField({
			name: 'heroTitle',
			title: 'Main headline',
			description: 'Leave empty to use the default.',
			type: 'string'
		}),
		defineField({ name: 'heroSubtitle', title: 'Sentence under the headline', type: 'text', rows: 3 }),
		defineField({
			name: 'heroImage',
			title: 'Hero photo',
			type: 'image',
			options: { hotspot: true },
			fields: [{ name: 'alt', title: 'Short description of the photo', type: 'string' }]
		}),
		defineField({
			name: 'intro',
			title: 'About GidiCare',
			description: 'A short paragraph about who you are and why you do this.',
			type: 'text',
			rows: 5
		}),
		defineField({
			name: 'fundsUse',
			title: 'How donations are used',
			description:
				'Only write what is true and that you can show. Examples: "Vet treatment", "Food and shelter". The section is hidden if this is empty.',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'fundUse',
					fields: [
						{ name: 'label', title: 'Title', type: 'string' },
						{ name: 'description', title: 'Description', type: 'text', rows: 2 }
					],
					preview: { select: { title: 'label', subtitle: 'description' } }
				})
			]
		}),
		defineField({
			name: 'faqs',
			title: 'Questions and answers',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'object',
					name: 'faq',
					fields: [
						{ name: 'question', title: 'Question', type: 'string' },
						{ name: 'answer', title: 'Answer', type: 'text', rows: 3 }
					],
					preview: { select: { title: 'question', subtitle: 'answer' } }
				})
			]
		}),
		defineField({
			name: 'legalNotice',
			title: 'Legal notice shown at the bottom of the page',
			description:
				'IMPORTANT: say exactly what GidiCare is (for example a registered charity with its number, or an initiative of Gidi Tour) and whether donations are tax-deductible. If you leave it empty, a neutral default is shown.',
			type: 'text',
			rows: 4
		})
	],
	preview: { prepare: () => ({ title: 'GidiCare page settings' }) }
});
