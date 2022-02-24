import { CustomDomain } from 'db'
import { Credentials } from 'models'
import useSWR from 'swr'
import { sendRequest } from 'utils'
import { fetcher } from '../utils'

export const useCustomDomains = ({
  userId,
  onError,
}: {
  userId?: string
  onError: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<
    { customDomains: Omit<CustomDomain, 'createdAt'>[] },
    Error
  >(userId ? `/api/users/${userId}/customDomains` : null, fetcher)
  if (error) onError(error)
  return {
    customDomains: data?.customDomains,
    isLoading: !error && !data,
    mutate,
  }
}

export const createCustomDomain = async (
  userId: string,
  customDomain: Omit<CustomDomain, 'ownerId' | 'createdAt'>
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/users/${userId}/customDomains`,
    method: 'POST',
    body: customDomain,
  })

export const deleteCustomDomain = async (
  userId: string,
  customDomain: string
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/users/${userId}/customDomains/${customDomain}`,
    method: 'DELETE',
  })
