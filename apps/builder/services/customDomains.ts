import { CustomDomain } from 'model'
import { Credentials } from 'models'
import { stringify } from 'qs'
import useSWR from 'swr'
import { sendRequest } from 'utils'
import { fetcher } from './utils'

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

export const createCustomDomain = async (
  workspaceId: string,
  customDomain: Omit<CustomDomain, 'createdAt' | 'workspaceId'>
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/customDomains?${stringify({ workspaceId })}`,
    method: 'POST',
    body: customDomain,
  })

export const deleteCustomDomain = async (
  workspaceId: string,
  customDomain: string
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/customDomains/${customDomain}?${stringify({ workspaceId })}`,
    method: 'DELETE',
  })
