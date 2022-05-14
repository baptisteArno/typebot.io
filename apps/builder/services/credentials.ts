import { Credentials } from 'models'
import { stringify } from 'qs'
import useSWR from 'swr'
import { sendRequest } from 'utils'
import { fetcher } from './utils'

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

export const createCredentials = async (
  credentials: Omit<Credentials, 'id' | 'iv' | 'createdAt'>
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/credentials?${stringify({
      workspaceId: credentials.workspaceId,
    })}`,
    method: 'POST',
    body: credentials,
  })

export const deleteCredentials = async (
  workspaceId: string,
  credentialsId: string
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/credentials/${credentialsId}?${stringify({ workspaceId })}`,
    method: 'DELETE',
  })
