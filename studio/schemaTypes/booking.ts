import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'booking',
  title: 'Booking',
  type: 'document',

  fields: [
    defineField({
      name: 'tours',
      title: 'Tours (snapshot)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'id', type: 'string'},
            {name: 'title', type: 'string'},
            {name: 'price', type: 'number'},
            {name: 'travelers', type: 'number'},
          ],
        },
      ],
    }),

    defineField({
      name: 'destination',
      title: 'Destination (freeform booking)',
      type: 'string',
    }),

    defineField({
      name: 'tripType',
      title: 'Trip type',
      type: 'string',
    }),

    defineField({
      name: 'startDate',
      title: 'Start date',
      type: 'string',
    }),

    defineField({
      name: 'endDate',
      title: 'End date',
      type: 'string',
    }),

    defineField({
      name: 'travelers',
      title: 'Travelers',
      type: 'number',
    }),

    defineField({
      name: 'addOns',
      title: 'Add-ons',
      type: 'array',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),

    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),

    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),

    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),

    // Booking amount in GBP
    defineField({
      name: 'amountGBP',
      title: 'Amount due (GBP)',
      type: 'number',
    }),

    // Actual amount charged by the payment provider
    defineField({
      name: 'amountCharged',
      title: 'Amount charged (minor units)',
      type: 'number',
    }),

    defineField({
      name: 'currency',
      title: 'Currency charged',
      type: 'string',
    }),
    defineField({
      name: 'convertedAmount',
      title: 'Converted Amount',
      type: 'number',
    }),

    defineField({
      name: 'countryCode',
      title: 'Country Code',
      type: 'string',
    }),

    defineField({
      name: 'currencyCode',
      title: 'Currency Code',
      type: 'string',
    }),

    defineField({
      name: 'estimatedTotal',
      title: 'Estimated Total',
      type: 'number',
    }),

    defineField({
      name: 'flexibleDates',
      title: 'Flexible Dates',
      type: 'string',
    }),

    defineField({
      name: 'tourIds',
      title: 'Tour IDs',
      type: 'array',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'travelingFrom',
      title: 'Traveling From',
      type: 'string',
    }),

    // Payment provider
    defineField({
      name: 'paymentMethod',
      title: 'Payment provider',
      type: 'string',
      options: {
        list: [
          {title: 'Stripe', value: 'stripe'},
          {title: 'dLocal', value: 'dlocal'},
        ],
      },
    }),

    // Payment status
    defineField({
      name: 'paymentStatus',
      title: 'Payment status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Paid', value: 'paid'},
          {title: 'Failed', value: 'failed'},
          {title: 'Refunded', value: 'refunded'},
        ],
      },
      initialValue: 'pending',
    }),

    // Stripe payment reference
    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
    }),

    // dLocal payment reference
    defineField({
      name: 'dlocalPaymentId',
      title: 'dLocal Payment ID',
      type: 'string',
    }),

    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
    }),
  ],

  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{field: 'createdAt', direction: 'desc'}],
    },
  ],

  preview: {
    select: {
      title: 'name',
      subtitle: 'paymentStatus',
    },
  },
})
