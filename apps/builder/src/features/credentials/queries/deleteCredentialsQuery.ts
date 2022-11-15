import { Credentials } from 'db'
import { stringify } from 'qs'
import { sendRequest } from 'utils'

export const deleteCredentialsQuery = async (
  workspaceId: string,
  credentialsId: string
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/credentials/${credentialsId}?${stringify({ workspaceId })}`,
    method: 'DELETE',
  })
