import { Plan } from '@typebot.io/prisma'
import type { Stripe } from 'stripe'

export const prices = {
  [Plan.STARTER]: 39,
  [Plan.PRO]: 89,
} as const

export const chatsLimits = {
  [Plan.FREE]: 200,
  [Plan.STARTER]: 2000,
  [Plan.PRO]: 10000,
} as const

export const seatsLimits = {
  [Plan.FREE]: 1,
  [Plan.OFFERED]: 1,
  [Plan.STARTER]: 2,
  [Plan.PRO]: 5,
  [Plan.LIFETIME]: 8,
} as const

export const starterChatTiers = [
  {
    up_to: 2000,
    flat_amount: 0,
  },
  {
    up_to: 2500,
    flat_amount: 1000,
  },
  {
    up_to: 3000,
    flat_amount: 1000,
  },
  {
    up_to: 3500,
    flat_amount: 1000,
  },
  {
    up_to: 4000,
    flat_amount: 1000,
  },
  {
    up_to: 'inf',
    unit_amount: 2,
  },
] satisfies Stripe.PriceCreateParams.Tier[]

export const proChatTiers = [
  {
    up_to: 10000,
    flat_amount: 0,
  },
  {
    up_to: 15000,
    flat_amount: 5000,
  },
  {
    up_to: 20000,
    flat_amount: 4500,
  },
  {
    up_to: 30000,
    flat_amount: 8500,
  },
  {
    up_to: 40000,
    flat_amount: 8000,
  },
  {
    up_to: 50000,
    flat_amount: 7500,
  },
  {
    up_to: 60000,
    flat_amount: 7225,
  },
  {
    up_to: 70000,
    flat_amount: 7000,
  },
  {
    up_to: 80000,
    flat_amount: 6800,
  },
  {
    up_to: 90000,
    flat_amount: 6600,
  },
  {
    up_to: 100000,
    flat_amount: 6400,
  },
  {
    up_to: 120000,
    flat_amount: 12400,
  },
  {
    up_to: 140000,
    flat_amount: 12000,
  },
  {
    up_to: 160000,
    flat_amount: 11800,
  },
  {
    up_to: 180000,
    flat_amount: 11600,
  },
  {
    up_to: 200000,
    flat_amount: 11400,
  },
  {
    up_to: 300000,
    flat_amount: 55000,
  },
  {
    up_to: 400000,
    flat_amount: 53000,
  },
  {
    up_to: 500000,
    flat_amount: 51000,
  },
  {
    up_to: 600000,
    flat_amount: 50000,
  },
  {
    up_to: 700000,
    flat_amount: 49000,
  },
  {
    up_to: 800000,
    flat_amount: 48000,
  },
  {
    up_to: 900000,
    flat_amount: 47000,
  },
  {
    up_to: 1000000,
    flat_amount: 46000,
  },
  {
    up_to: 1200000,
    flat_amount: 91400,
  },
  {
    up_to: 1400000,
    flat_amount: 90800,
  },
  {
    up_to: 1600000,
    flat_amount: 90000,
  },
  {
    up_to: 1800000,
    flat_amount: 89400,
  },
  {
    up_to: 'inf',
    unit_amount_decimal: '0.442',
  },
] satisfies Stripe.PriceCreateParams.Tier[]
