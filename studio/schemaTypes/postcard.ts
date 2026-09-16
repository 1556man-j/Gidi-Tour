import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'postcard',
	title: 'Team Postcard',
	type: 'document',
	fields: [
		defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true }, validation: (r) => r.required() }),
		defineField({ name: 'place', title: 'Place', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'caption', title: 'Caption', type: 'string' }),
		defineField({ name: 'order', title: 'Display order', type: 'number' })
	],
	orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'place', subtitle: 'caption', media: 'image' }
	}
});