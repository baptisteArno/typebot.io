import { getChatsLimit } from '@typebot.io/lib/pricing'
import { priceIds } from '@typebot.io/lib/api/pricing'

export const parseSubscriptionItems = (
  plan: 'STARTER' | 'PRO',
  additionalChats: number,
  isYearly: boolean
) => {
  const frequency = isYearly ? 'yearly' : 'monthly'
  return [
    {
      price: priceIds[plan].base[frequency],
      quantity: 1,
    },
  ].concat(
    additionalChats > 0
      ? [
          {
            price: priceIds[plan].chats[frequency],
            quantity: getChatsLimit({
              plan,
              additionalChatsIndex: additionalChats,
              customChatsLimit: null,
            }),
          },
        ]
      : []
  )
}
