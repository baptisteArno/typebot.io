import { fetcher } from '@/utils/helpers'
import { Typebot } from 'models'
import { stringify } from 'qs'
import useSWR from 'swr'

export const useLinkedTypebots = ({
  workspaceId,
  typebotId,
  typebotIds,
  onError,
}: {
  workspaceId?: string
  typebotId?: string
  typebotIds?: string[]
  onError: (error: Error) => void
}) => {
  const params = stringify({ typebotIds, workspaceId }, { indices: false })
  const { data, error, mutate } = useSWR<
    {
      typebots: Typebot[]
    },
    Error
  >(
    workspaceId
      ? typebotIds?.every((id) => typebotId === id)
        ? undefined
        : `/api/typebots?${params}`
      : null,
    fetcher
  )
  if (error) onError(error)
  return {
    typebots: data?.typebots,
    isLoading: !error && !data,
    mutate,
  }
}
