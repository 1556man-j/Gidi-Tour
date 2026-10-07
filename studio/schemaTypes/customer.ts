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
      name: 'passwordResetToken',
      title: 'Password Reset Token',
      type: 'string',
    }),

    defineField({
      name: 'passwordResetExpires',
      title: 'Password Reset Expires',
      type: 'datetime',
    }),
    defineField({name: 'avatar', title: 'Profile photo', type: 'image'}),
    defineField({name: 'dateOfBirth', title: 'Date of birth', type: 'date'}),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'object',
      fields: [
        {name: 'line1', title: 'Address line 1', type: 'string'},
        {name: 'line2', title: 'Address line 2', type: 'string'},
        {name: 'city', title: 'City', type: 'string'},
        {name: 'region', title: 'State / Region', type: 'string'},
        {name: 'postalCode', title: 'Postal code', type: 'string'},
        {name: 'country', title: 'Country', type: 'string'},
      ],
    }),
    defineField({
      name: 'emergencyContact',
      title: 'Emergency contact',
      type: 'object',
      fields: [
        {name: 'name', title: 'Name', type: 'string'},
        {name: 'relationship', title: 'Relationship', type: 'string'},
        {name: 'phone', title: 'Phone (with country code)', type: 'string'},
      ],
    }),
    defineField({name: 'travelNotes', title: 'Dietary / accessibility notes', type: 'text'}),
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
