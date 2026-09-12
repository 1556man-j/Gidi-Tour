import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'siteSettings',
	title: 'Site Settings',
	type: 'document',
	// This makes it a single global document, not a list of many
	__experimental_actions: ['update', 'publish'],
	fields: [
		defineField({ name: 'siteName', title: 'Site name', type: 'string' }),
		defineField({ name: 'logo', title: 'Logo', type: 'image' }),
		defineField({ name: 'tagline', title: 'Tagline', type: 'string' }),
		defineField({ name: 'email', title: 'Contact email', type: 'string' }),
		defineField({ name: 'phone', title: 'Contact phone', type: 'string' }),
		defineField({ name: 'whatsapp', title: 'WhatsApp number', type: 'string' }),
		defineField({ name: 'address', title: 'Office address', type: 'text' }),
		defineField({
			name: 'socials',
			title: 'Social links',
			type: 'array',
			of: [
				{
					type: 'object',
					fields: [
						{
							name: 'platform',
							type: 'string',
							options: { list: ['Instagram', 'Twitter', 'Facebook', 'TikTok'] }
						},
						{ name: 'url', type: 'url' }
					]
				}
			]
		}),
		defineField({
			name: 'defaultSeo',
			title: 'Default SEO (fallback for any page without its own)',
			type: 'seo'
		})
	]
});