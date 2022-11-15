import { ApiToken } from 'db'
import { sendRequest } from 'utils'

export const deleteApiTokenQuery = ({
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
