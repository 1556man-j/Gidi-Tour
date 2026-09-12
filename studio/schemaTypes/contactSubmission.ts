import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'contactSubmission',
	title: 'Contact Submission',
	type: 'document',
	// Admins should only ever read/delete these, never "create" or "edit" by hand
	fields: [
		defineField({ name: 'name', title: 'Name', type: 'string' }),
		defineField({ name: 'email', title: 'Email', type: 'string' }),
		defineField({ name: 'phone', title: 'Phone', type: 'string' }),
		defineField({ name: 'interest', title: 'Interest', type: 'string' }),
		defineField({ name: 'message', title: 'Message', type: 'text' }),
		defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime' }),
		defineField({
			name: 'status',
			title: 'Status',
			type: 'string',
			options: { list: ['new', 'contacted', 'closed'] },
			initialValue: 'new'
		})
	],
	orderings: [
		{
			title: 'Newest first',
			name: 'submittedAtDesc',
			by: [{ field: 'submittedAt', direction: 'desc' }]
		}
	],
	preview: {
		select: { title: 'name', subtitle: 'email' }
	}
});