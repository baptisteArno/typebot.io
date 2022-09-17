import { sendRequest } from 'utils'

export const cancelSubscriptionQuery = (stripeId: string) =>
  sendRequest({
    url: `api/stripe/subscription?stripeId=${stripeId}`,
    method: 'DELETE',
  })
