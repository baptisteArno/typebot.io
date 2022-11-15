import { fetcher } from '@/utils/helpers'
import { Credentials } from 'models'
import { stringify } from 'qs'
import useSWR from 'swr'

export const useCredentials = ({
  workspaceId,
  onError,
}: {
  workspaceId?: string
  onError?: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ credentials: Credentials[] }, Error>(
    workspaceId ? `/api/credentials?${stringify({ workspaceId })}` : null,
    fetcher
  )
  if (error && onError) onError(error)
  return {
    credentials: data?.credentials ?? [],
    isLoading: !error && !data,
    mutate,
  }
}
