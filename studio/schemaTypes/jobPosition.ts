import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'jobPosition',
	title: 'Job Position',
	type: 'document',
	fields: [
		defineField({ name: 'title', title: 'Role title', type: 'string', validation: (r) => r.required() }),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: { source: 'title' },
			validation: (r) => r.required()
		}),
		defineField({ name: 'team', title: 'Team', type: 'string' }),
		defineField({ name: 'location', title: 'Location', type: 'string' }),
		defineField({ name: 'commitment', title: 'Commitment', type: 'string' }),
		defineField({ name: 'summary', title: 'Summary', type: 'text', validation: (r) => r.required() }),
		defineField({ name: 'order', title: 'Display order', type: 'number' }),
		defineField({ name: 'isOpen', title: 'Currently open?', type: 'boolean', initialValue: true })
	],
	orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'title', subtitle: 'location' }
	}
});