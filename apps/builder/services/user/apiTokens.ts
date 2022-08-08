import { ApiToken } from 'db'
import { fetcher } from 'services/utils'
import useSWR, { KeyedMutator } from 'swr'
import { env, sendRequest } from 'utils'

export type ApiTokenFromServer = { id: string; name: string; createdAt: string }

type ReturnedProps = {
  apiTokens?: ApiTokenFromServer[]
  isLoading: boolean
  mutate: KeyedMutator<ServerResponse>
}

type ServerResponse = {
  apiTokens: ApiTokenFromServer[]
}
export const useApiTokens = ({
  userId,
  onError,
}: {
  userId?: string
  onError: (error: Error) => void
}): ReturnedProps => {
  const { data, error, mutate } = useSWR<ServerResponse, Error>(
    userId ? `/api/users/${userId}/api-tokens` : null,
    fetcher,
    {
      dedupingInterval: env('E2E_TEST') === 'true' ? 0 : undefined,
    }
  )
  if (error) onError(error)
  return {
    apiTokens: data?.apiTokens,
    isLoading: !error && !data,
    mutate,
  }
}

export const createApiToken = (userId: string, { name }: { name: string }) =>
  sendRequest<{ apiToken: ApiTokenFromServer & { token: string } }>({
    url: `/api/users/${userId}/api-tokens`,
    method: 'POST',
    body: {
      name,
    },
  })

export const deleteApiToken = ({
  userId,
  tokenId,
}: {
  userId: string
  tokenId: string
}) =>
  sendRequest<{ apiToken: ApiToken }>({
    url: `/api/users/${userId}/api-tokens/${tokenId}`,
    method: 'DELETE',
  })
