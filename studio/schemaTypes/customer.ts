import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'customer',
  title: 'Customer',
  type: 'document',
  fields: [
    defineField({name: 'name', title: 'Name', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string', validation: (r) => r.required()}),
    defineField({name: 'passwordHash', title: 'Password hash', type: 'string'}),
    defineField({
      name: 'provider',
      title: 'Sign-up method',
      type: 'string',
      options: {list: ['credentials', 'google']},
    }),
    defineField({name: 'createdAt', title: 'Joined', type: 'datetime'}),
    defineField({name: 'nationality', title: 'Nationality (country)', type: 'string'}),
    defineField({name: 'phoneDialCode', title: 'Phone dial code', type: 'string'}),
    defineField({name: 'phoneNumber', title: 'Phone number (local part)', type: 'string'}),
  ],
  preview: {
    select: {title: 'name', subtitle: 'email'},
  },
})
