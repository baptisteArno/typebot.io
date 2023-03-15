import { Plan } from '@typebot.io/prisma'

export const parseSubscriptionItems = (
  plan: Plan,
  additionalChats: number,
  additionalStorage: number
) =>
  [
    {
      price:
        plan === Plan.STARTER
          ? process.env.STRIPE_STARTER_PRICE_ID
          : process.env.STRIPE_PRO_PRICE_ID,
      quantity: 1,
    },
  ]
    .concat(
      additionalChats > 0
        ? [
            {
              price: process.env.STRIPE_ADDITIONAL_CHATS_PRICE_ID,
              quantity: additionalChats,
            },
          ]
        : []
    )
    .concat(
      additionalStorage > 0
        ? [
            {
              price: process.env.STRIPE_ADDITIONAL_STORAGE_PRICE_ID,
              quantity: additionalStorage,
            },
          ]
        : []
    )
