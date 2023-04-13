import {
  getChatsLimit,
  getStorageLimit,
  priceIds,
} from '@typebot.io/lib/pricing'

export const parseSubscriptionItems = (
  plan: 'STARTER' | 'PRO',
  additionalChats: number,
  additionalStorage: number,
  isYearly: boolean
) => {
  const frequency = isYearly ? 'yearly' : 'monthly'
  return [
    {
      price: priceIds[plan].base[frequency],
      quantity: 1,
    },
  ]
    .concat(
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
    .concat(
      additionalStorage > 0
        ? [
            {
              price: priceIds[plan].storage[frequency],
              quantity: getStorageLimit({
                plan,
                additionalStorageIndex: additionalStorage,
                customStorageLimit: null,
              }),
            },
          ]
        : []
    )
}
