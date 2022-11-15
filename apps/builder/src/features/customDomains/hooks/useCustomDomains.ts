import { CustomDomain } from 'db'
import { stringify } from 'qs'
import { fetcher } from '@/utils/helpers'
import useSWR from 'swr'

export const useCustomDomains = ({
  workspaceId,
  onError,
}: {
  workspaceId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { customDomains: Omit<CustomDomain, 'createdAt'>[] },
    Error
  >(
    workspaceId ? `/api/customDomains?${stringify({ workspaceId })}` : null,
    fetcher
  )
  if (error) onError(error)
  return {
    customDomains: data?.customDomains,
    isLoading: !error && !data,
    mutate,
  }
}
