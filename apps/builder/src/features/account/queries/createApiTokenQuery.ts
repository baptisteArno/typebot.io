import { sendRequest } from 'utils'
import { ApiTokenFromServer } from '../types'

export const createApiTokenQuery = (
  userId: string,
  { name }: { name: string }
) =>
  sendRequest<{ apiToken: ApiTokenFromServer & { token: string } }>({
    url: `/api/users/${userId}/api-tokens`,
    method: 'POST',
    body: {
      name,
    },
  })
