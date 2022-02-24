import { Typebot } from 'models'
import { fetcher } from 'services/utils'
import useSWR from 'swr'
import { isNotDefined } from 'utils'

export const useSharedTypebotsCount = ({
  userId,
  onError,
}: {
  userId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ count: number }, Error>(
    userId ? `/api/users/${userId}/sharedTypebots?count=true` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    totalSharedTypebots: data?.count ?? 0,
    isLoading: !error && isNotDefined(data?.count),
    mutate,
  }
}

export const useSharedTypebots = ({
  userId,
  onError,
}: {
  userId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { sharedTypebots: Pick<Typebot, 'name' | 'id' | 'publishedTypebotId'>[] },
    Error
  >(userId ? `/api/users/${userId}/sharedTypebots` : null, fetcher)
  if (error) onError(error)
  return {
    sharedTypebots: data?.sharedTypebots,
    isLoading: !error && isNotDefined(data),
    mutate,
  }
}
