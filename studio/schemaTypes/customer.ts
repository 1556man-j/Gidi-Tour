import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'storeOrder',
  title: 'Store Order',
  type: 'document',
  fields: [
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'orderItem',
          fields: [
            {name: 'id', title: 'Product slug', type: 'string'},
            {
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {list: ['magazine', 'merchandise']},
            },
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'price', title: 'Price (GBP)', type: 'number'},
            {name: 'quantity', title: 'Quantity', type: 'number'},
            {name: 'variant', title: 'Variant', type: 'string'},
          ],
        },
      ],
    }),

    defineField({name: 'subtotal', title: 'Subtotal (GBP)', type: 'number'}),

    defineField({name: 'name', title: 'Customer name', type: 'string'}),
    defineField({name: 'email', title: 'Customer email', type: 'string'}),
    defineField({name: 'customerId', title: 'Customer account ID', type: 'string'}),

    defineField({
      name: 'shipping',
      title: 'Shipping address',
      type: 'object',
      fields: [
        {name: 'address', type: 'string'},
        {name: 'city', type: 'string'},
        {name: 'country', type: 'string'},
        {name: 'postcode', type: 'string'},
      ],
    }),

    defineField({name: 'amountCharged', title: 'Amount charged (minor units)', type: 'number'}),
    defineField({name: 'convertedAmount', title: 'Converted amount', type: 'number'}),
    defineField({name: 'currency', title: 'Currency (charged)', type: 'string'}),
    defineField({name: 'currencyCode', title: 'Currency code', type: 'string'}),
    defineField({name: 'countryCode', title: 'Country code', type: 'string'}),

    defineField({
      name: 'paymentMethod',
      title: 'Payment method',
      type: 'string',
      options: {list: ['stripe', 'dlocal']},
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment status',
      type: 'string',
      options: {list: ['pending', 'paid']},
      initialValue: 'pending',
    }),

    defineField({name: 'confirmationEmailSent', title: 'Confirmation email sent', type: 'boolean'}),
    defineField({name: 'confirmationEmailSentAt', title: 'Sent at', type: 'datetime'}),

    defineField({name: 'stripePaymentIntentId', title: 'Stripe PaymentIntent ID', type: 'string'}),
    defineField({name: 'dlocalPaymentId', title: 'dLocal payment ID', type: 'string'}),

    defineField({name: 'createdAt', title: 'Created at', type: 'datetime'}),
  ],

  preview: {
    select: {title: 'name', subtitle: 'email', status: 'paymentStatus'},
    prepare({title, subtitle, status}) {
      return {title: `${title} (${status})`, subtitle}
    },
  },
})
