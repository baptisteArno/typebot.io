import { Credentials } from 'models'
import { stringify } from 'qs'
import { sendRequest } from 'utils'

export const createCredentialsQuery = async (
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
