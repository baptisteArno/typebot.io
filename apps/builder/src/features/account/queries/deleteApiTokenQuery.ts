import { ApiToken } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

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
