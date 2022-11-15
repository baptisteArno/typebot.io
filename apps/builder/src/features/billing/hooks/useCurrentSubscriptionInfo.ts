import { fetcher } from '@/utils/helpers'
import { Plan } from 'db'
import useSWR from 'swr'

export const useCurrentSubscriptionInfo = ({
  stripeId,
  plan,
}: {
  stripeId?: string | null
  plan?: Plan
}) => {
  const { data, mutate } = useSWR<
    {
      additionalChatsIndex: number
      additionalStorageIndex: number
    },
    Error
  >(
    stripeId && (plan === Plan.STARTER || plan === Plan.PRO)
      ? `/api/stripe/subscription?stripeId=${stripeId}`
      : null,
    fetcher
  )
  return {
    data: !stripeId
      ? { additionalChatsIndex: 0, additionalStorageIndex: 0 }
      : data,
    mutate,
  }
}
