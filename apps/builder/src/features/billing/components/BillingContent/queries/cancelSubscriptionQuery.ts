import { sendRequest } from '@typebot.io/lib'

export const cancelSubscriptionQuery = (stripeId: string) =>
  sendRequest({
    url: `api/stripe/subscription?stripeId=${stripeId}`,
    method: 'DELETE',
  })
