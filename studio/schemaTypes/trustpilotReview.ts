import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'trustpilotReview',
	title: 'Trustpilot Review',
	type: 'document',
	fields: [
		defineField({ name: 'name', title: 'Reviewer name', type: 'string', validation: (r) => r.required() }),
		defineField({ name: 'location', title: 'Location', type: 'string' }),
		defineField({ name: 'rating', title: 'Rating (1–5)', type: 'number', validation: (r) => r.required().min(1).max(5) }),
		defineField({ name: 'quote', title: 'Review text', type: 'text', validation: (r) => r.required() }),
		defineField({ name: 'avatar', title: 'Avatar (optional)', type: 'image', options: { hotspot: true } }),
		defineField({
			name: 'reviewUrl',
			title: 'Link to real review on Trustpilot',
			type: 'url',
			description: 'Paste the direct link to this review on your Trustpilot profile.'
		}),
		defineField({ name: 'datePosted', title: 'Date posted', type: 'date' }),
		defineField({ name: 'order', title: 'Display order', type: 'number' })
	],
	orderings: [{ title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] }],
	preview: {
		select: { title: 'name', subtitle: 'quote' }
	}
});