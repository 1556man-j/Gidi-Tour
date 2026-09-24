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
            {name: 'image', type: 'string'},
          ],
        },
      ],
    }),

    defineField({
      name: 'tourIds',
      title: 'Tour IDs',
      type: 'array',
      of: [{type: 'string'}],
    }),

    defineField({
      name: 'destination',
      title: 'Destination',
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
      name: 'flexibleDates',
      title: 'Flexible dates',
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
      title: 'Customer name',
      type: 'string',
    }),

    defineField({
      name: 'email',
      title: 'Customer email',
      type: 'string',
    }),

    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),

    defineField({
      name: 'travelingFrom',
      title: 'Traveling from',
      type: 'string',
    }),

    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),

    // =========================
    // PRICING
    // =========================

    defineField({
      name: 'amountGBP',
      title: 'Amount due (GBP)',
      type: 'number',
    }),

    defineField({
      name: 'convertedAmount',
      title: 'Converted amount',
      type: 'number',
    }),

    defineField({
      name: 'estimatedTotal',
      title: 'Estimated total',
      type: 'number',
    }),

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
      name: 'currencyCode',
      title: 'Customer currency',
      type: 'string',
    }),

    defineField({
      name: 'countryCode',
      title: 'Customer country',
      type: 'string',
    }),

    // =========================
    // PAYMENT
    // =========================

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

    defineField({
      name: 'confirmationEmailSent',
      title: 'Confirmation email sent',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'confirmationEmailSentAt',
      title: 'Confirmation email sent at',
      type: 'datetime',
    }),

    // =========================
    // STRIPE
    // =========================

    defineField({
      name: 'stripePaymentIntentId',
      title: 'Stripe Payment Intent ID',
      type: 'string',
    }),

    defineField({
      name: 'stripeCheckoutSessionId',
      title: 'Stripe Checkout Session ID',
      type: 'string',
    }),

    // =========================
    // DLOCAL
    // =========================

    defineField({
      name: 'dlocalPaymentId',
      title: 'dLocal Payment ID',
      type: 'string',
    }),

    defineField({
      name: 'dlocalTransactionId',
      title: 'dLocal Transaction ID',
      type: 'string',
    }),

    // =========================
    // DATE
    // =========================

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
