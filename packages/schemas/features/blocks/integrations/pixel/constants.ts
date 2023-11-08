// Reference: https://developers.facebook.com/docs/meta-pixel/reference#standard-events

import { PixelBlock } from './schema'

export const pixelEventTypes = [
  'Lead',
  'Contact',
  'CompleteRegistration',
  'Schedule',
  'SubmitApplication',
  'ViewContent',
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'InitiateCheckout',
  'Purchase',
  'Search',
  'StartTrial',
  'Subscribe',
] as const

export const allEventTypes = ['Custom', ...pixelEventTypes] as const

export const pixelObjectProperties: {
  key: string
  type: 'text' | 'code'
  associatedEvents: (typeof pixelEventTypes)[number][]
}[] = [
  {
    key: 'content_category',
    type: 'text',
    associatedEvents: [
      'AddPaymentInfo',
      'AddToWishlist',
      'InitiateCheckout',
      'Lead',
      'Search',
      'ViewContent',
    ],
  },
  {
    key: 'content_ids',
    type: 'code',
    associatedEvents: [
      'AddPaymentInfo',
      'AddToCart',
      'AddToWishlist',
      'InitiateCheckout',
      'Purchase',
      'Search',
      'ViewContent',
    ],
  },
  {
    key: 'content_name',
    type: 'text',
    associatedEvents: [
      'AddToCart',
      'AddToWishlist',
      'CompleteRegistration',
      'Lead',
      'Purchase',
      'ViewContent',
    ],
  },
  {
    key: 'contents',
    type: 'code',
    associatedEvents: [
      'AddPaymentInfo',
      'AddToCart',
      'AddToWishlist',
      'InitiateCheckout',
      'Purchase',
      'Search',
      'ViewContent',
    ],
  },
  {
    key: 'currency',
    type: 'text',
    associatedEvents: [
      'AddPaymentInfo',
      'AddToCart',
      'AddToWishlist',
      'CompleteRegistration',
      'InitiateCheckout',
      'Lead',
      'Purchase',
      'Search',
      'StartTrial',
      'Subscribe',
      'ViewContent',
    ],
  },
  {
    key: 'num_items',
    type: 'text',
    associatedEvents: ['InitiateCheckout', 'Purchase'],
  },
  {
    key: 'predicted_ltv',
    type: 'text',
    associatedEvents: ['StartTrial', 'Subscribe'],
  },
  {
    key: 'search_string',
    type: 'text',
    associatedEvents: ['Search'],
  },
  {
    key: 'status',
    type: 'text',
    associatedEvents: ['CompleteRegistration'],
  },
  {
    key: 'value',
    type: 'text',
    associatedEvents: [
      'AddPaymentInfo',
      'AddToCart',
      'AddToWishlist',
      'CompleteRegistration',
      'InitiateCheckout',
      'Lead',
      'Purchase',
      'Search',
      'StartTrial',
      'Subscribe',
      'ViewContent',
    ],
  },
]

export const defaultPixelOptions = {
  isInitSkip: false,
} as const satisfies PixelBlock['options']
