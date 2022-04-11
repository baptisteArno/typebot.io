import { Credentials } from 'models'
import useSWR from 'swr'
import { sendRequest } from 'utils'
import { fetcher } from '../utils'

export const useCredentials = ({
  userId,
  onError,
}: {
  userId?: string
  onError?: (error: Error) => void
}) => {
  const { data, error, mutate } = useSWR<{ credentials: Credentials[] }, Error>(
    userId ? `/api/users/${userId}/credentials` : null,
    fetcher
  )
  if (error && onError) onError(error)
  return {
    credentials: data?.credentials ?? [],
    isLoading: !error && !data,
    mutate,
  }
}

export const createCredentials = async (
  userId: string,
  credentials: Omit<Credentials, 'ownerId' | 'id' | 'iv' | 'createdAt'>
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/users/${userId}/credentials`,
    method: 'POST',
    body: credentials,
  })

export const deleteCredentials = async (
  userId: string,
  credentialsId: string
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/users/${userId}/credentials/${credentialsId}`,
    method: 'DELETE',
  })
