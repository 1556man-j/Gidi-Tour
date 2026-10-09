import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'review',
	title: 'Review',
	type: 'document',
	fields: [
		defineField({
			name: 'tour',
			type: 'reference',
			to: [{ type: 'tour' }],
			validation: (r) => r.required()
		}),
		defineField({ name: 'name', type: 'string', validation: (r) => r.required().max(60) }),
		defineField({ name: 'location', title: 'Where are they from?', type: 'string' }),
		defineField({
			name: 'rating',
			type: 'number',
			validation: (r) => r.required().integer().min(1).max(5)
		}),
		defineField({ name: 'title', type: 'string', validation: (r) => r.max(100) }),
		defineField({
			name: 'comment',
			type: 'text',
			validation: (r) => r.required().min(10).max(1500)
		}),
		defineField({ name: 'approved', type: 'boolean', initialValue: false }),
		defineField({ name: 'createdAt', type: 'datetime' })
	],
	preview: {
		select: { title: 'name', subtitle: 'comment', approved: 'approved' },
		prepare: ({ title, subtitle, approved }) => ({
			title: `${approved ? '✅' : '⏳'} ${title}`,
			subtitle
		})
	}
});