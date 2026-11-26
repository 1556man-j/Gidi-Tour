import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'guide',
	title: 'Tour guide',
	type: 'document',
	fields: [
		defineField({
			name: 'active',
			title: 'Approved (active)',
			type: 'boolean',
			initialValue: true,
			description:
				'Switch ON to approve a guide. People who apply in the app arrive switched OFF with status "pending". Switching it off removes the guide inbox and stops new chats.'
		}),
		defineField({
			name: 'applicationStatus',
			title: 'Application status',
			type: 'string',
			options: {
				list: [
					{ title: 'Pending review', value: 'pending' },
					{ title: 'Approved', value: 'approved' },
					{ title: 'Rejected', value: 'rejected' }
				],
				layout: 'radio'
			},
			description: 'Set to Approved when you switch the guide on, or Rejected to decline. Guides added by hand can leave this empty.'
		}),
		defineField({ name: 'name', type: 'string', validation: (r) => r.required().max(80) }),
		defineField({
			name: 'email',
			title: 'Sign-in email',
			type: 'string',
			description:
				'The email on the guide’s Gidi Tour account. It decides who sees the Guide screens in the app. Guides who apply in the app get this filled in automatically.',
			validation: (r) =>
				r
					.required()
					.custom((v) => (typeof v === 'string' && /^\S+@\S+\.\S+$/.test(v) ? true : 'Enter a valid email'))
		}),
		defineField({ name: 'photo', type: 'image', options: { hotspot: true } }),
		defineField({ name: 'bio', title: 'Short bio', type: 'text', rows: 3, validation: (r) => r.max(600) }),
		defineField({ name: 'languages', type: 'array', of: [{ type: 'string' }], options: { layout: 'tags' } }),
		defineField({ name: 'country', title: 'Based in (country)', type: 'string' }),
		defineField({ name: 'city', title: 'Based in (city)', type: 'string' }),
		defineField({ name: 'experienceYears', title: 'Years of guiding experience', type: 'number' }),
		defineField({ name: 'phone', title: 'Phone (for the team only)', type: 'string', description: 'Never shown to travellers.' }),
		defineField({ name: 'appliedAt', title: 'Applied on', type: 'datetime', readOnly: true }),
		defineField({
			name: 'tours',
			title: 'Tours this guide leads',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'tour' }] }],
			description:
				'Applicants are linked automatically to the tours in their country that they ticked. When someone pays for one of these tours they are connected to this guide. If several guides lead the same tour, the one with the fewest open chats is chosen.'
		}),
		defineField({
			name: 'coversAllTours',
			title: 'Can take any tour',
			type: 'boolean',
			initialValue: false,
			description: 'Use for a backup guide who can be given any booking when no one else is listed for it.'
		})
	],
	orderings: [{ title: 'Pending first', name: 'pending', by: [{ field: 'active', direction: 'asc' }, { field: 'appliedAt', direction: 'desc' }] }],
	preview: {
		select: { title: 'name', subtitle: 'email', media: 'photo', active: 'active', status: 'applicationStatus', country: 'country' },
		prepare: ({ title, subtitle, media, active, status, country }) => ({
			title: `${active ? '' : status === 'rejected' ? '✖ ' : '⏳ '}${title}`,
			subtitle: [active ? 'Active' : status === 'rejected' ? 'Rejected' : 'Pending / off', country, subtitle].filter(Boolean).join(' · '),
			media
		})
	}
});
