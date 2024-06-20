import { ApiToken } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'

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
