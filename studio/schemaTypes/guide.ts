import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'guide',
	title: 'Tour guide',
	type: 'document',
	fields: [
		defineField({ name: 'name', type: 'string', validation: (r) => r.required().max(80) }),
		defineField({
			name: 'email',
			title: 'Sign-in email',
			type: 'string',
			description:
				'The email the guide uses for their Gidi Tour account. The guide must create an account in the app with this exact email. It decides who sees the Guide inbox.',
			validation: (r) =>
				r
					.required()
					.custom((v) => (typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v) ? true : 'Enter a valid email'))
		}),
		defineField({ name: 'photo', type: 'image', options: { hotspot: true } }),
		defineField({ name: 'bio', title: 'Short bio', type: 'text', rows: 3, validation: (r) => r.max(400) }),
		defineField({ name: 'languages', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
		defineField({
			name: 'tours',
			title: 'Tours this guide leads',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'tour' }] }],
			description: 'When someone pays for one of these tours, they are connected to this guide. If several guides lead the same tour, the one with the fewest open chats is chosen.'
		}),
		defineField({
			name: 'coversAllTours',
			title: 'Can take any tour',
			type: 'boolean',
			initialValue: false,
			description: 'Use for a backup guide who can be given any booking when no one else is listed for it.'
		}),
		defineField({
			name: 'active',
			title: 'Active',
			type: 'boolean',
			initialValue: true,
			description: 'Turn off to stop new chats and remove the guide inbox.'
		})
	],
	preview: {
		select: { title: 'name', subtitle: 'email', media: 'photo', active: 'active' },
		prepare: ({ title, subtitle, media, active }) => ({
			title: `${active === false ? '⏸ ' : ''}${title}`,
			subtitle,
			media
		})
	}
});
