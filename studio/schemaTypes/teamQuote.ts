import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'teamQuote',
	title: 'Team Quote',
	type: 'document',
	fields: [
		defineField({ name: 'quote', title: 'Quote', type: 'text', validation: (r) => r.required() }),
		defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'role', title: 'Role', type: 'string' }),
		defineField({ name: 'photo', title: 'Photo', type: 'image', options: { hotspot: true } }),
		defineField({ name: 'order', title: 'Display order', type: 'number' })
	],
	orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'name', subtitle: 'role', media: 'photo' }
	}
});