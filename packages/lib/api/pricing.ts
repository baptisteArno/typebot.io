import { env } from '@typebot.io/env'
import { Plan } from '@typebot.io/prisma'

export const priceIds = {
  [Plan.STARTER]: {
    base: {
      monthly: env.STRIPE_STARTER_MONTHLY_PRICE_ID,
      yearly: env.STRIPE_STARTER_YEARLY_PRICE_ID,
    },
    chats: {
      monthly: env.STRIPE_STARTER_CHATS_MONTHLY_PRICE_ID,
      yearly: env.STRIPE_STARTER_CHATS_YEARLY_PRICE_ID,
    },
    storage: {
      monthly: env.STRIPE_STARTER_STORAGE_MONTHLY_PRICE_ID,
      yearly: env.STRIPE_STARTER_STORAGE_YEARLY_PRICE_ID,
    },
  },
  [Plan.PRO]: {
    base: {
      monthly: env.STRIPE_PRO_MONTHLY_PRICE_ID,
      yearly: env.STRIPE_PRO_YEARLY_PRICE_ID,
    },
    chats: {
      monthly: env.STRIPE_PRO_CHATS_MONTHLY_PRICE_ID,
      yearly: env.STRIPE_PRO_CHATS_YEARLY_PRICE_ID,
    },
    storage: {
      monthly: env.STRIPE_PRO_STORAGE_MONTHLY_PRICE_ID,
      yearly: env.STRIPE_PRO_STORAGE_YEARLY_PRICE_ID,
    },
  },
}
