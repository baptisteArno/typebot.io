import { Credentials } from 'db'
import useSWR from 'swr'
import { fetcher } from './utils'

export const useCredentials = ({
  userId,
  onError,
}: {
  userId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ credentials: Credentials[] }, Error>(
    userId ? `/api/users/${userId}/credentials` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    credentials: data?.credentials,
    isLoading: !error && !data,
    mutate,
  }
}
