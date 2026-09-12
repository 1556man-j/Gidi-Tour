import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'pageSeo',
	title: 'Page SEO',
	type: 'document',
	fields: [
		defineField({
			name: 'pageId',
			title: 'Page',
			type: 'string',
			description: 'Which page this SEO applies to. Must match exactly what the code expects.',
			options: {
				list: [
					{ title: 'Home', value: 'home' },
					{ title: 'Tours (listing)', value: 'tours' },
					{ title: 'Destinations (listing)', value: 'destinations' },
					{ title: 'Book a Tour', value: 'book' },
					{ title: 'Contact', value: 'contact' },
					{ title: 'Travel Journal (listing)', value: 'stories' },
					{ title: 'About Us', value: 'about' }
				]
			},
			validation: (r) => r.required()
		}),
		defineField({ name: 'seo', title: 'SEO', type: 'seo', validation: (r) => r.required() })
	],
	preview: {
		select: { title: 'pageId' }
	}
});