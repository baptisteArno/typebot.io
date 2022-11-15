import { fetcher } from '@/utils/helpers'
import { PublicTypebot, Typebot, Webhook } from 'models'
import useSWR from 'swr'
import { env } from 'utils'

export const useTypebotQuery = ({
  typebotId,
  onError,
}: {
  typebotId: string
  onError?: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    {
      typebot: Typebot
      webhooks: Webhook[]
      publishedTypebot?: PublicTypebot
      isReadOnly?: boolean
    },
    Error
  >(`/api/typebots/${typebotId}`, fetcher, {
    dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
  })
  if (error && onError) onError(error)
  return {
    typebot: data?.typebot,
    webhooks: data?.webhooks,
    publishedTypebot: data?.publishedTypebot,
    isReadOnly: data?.isReadOnly,
    isLoading: !error && !data,
    mutate,
  }
}
