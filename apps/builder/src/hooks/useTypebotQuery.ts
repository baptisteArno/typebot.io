import { fetcher } from '@/helpers/fetcher'
import { PublicTypebot, Typebot, Webhook } from '@typebot.io/schemas'
import useSWR from 'swr'
import { env } from '@typebot.io/lib'

export const useTypebotQuery = ({
  typebotId,
  onError,
}: {
  typebotId?: string
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
  >(typebotId ? `/api/typebots/${typebotId}` : null, fetcher, {
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
