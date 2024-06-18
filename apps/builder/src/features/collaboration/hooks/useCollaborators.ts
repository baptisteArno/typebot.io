import { fetcher } from '@/helpers/fetcher'
import useSWR from 'swr'
import { Collaborator } from '../types'

export const useCollaborators = ({
  sniperId,
  onError,
}: {
  sniperId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { collaborators: Collaborator[] },
    Error
  >(sniperId ? `/api/snipers/${sniperId}/collaborators` : null, fetcher)
  if (error) onError(error)
  return {
    collaborators: data?.collaborators,
    isLoading: !error && !data,
    mutate,
  }
}
