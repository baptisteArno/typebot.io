import { Credentials } from 'db'
import { stringify } from 'qs'
import { sendRequest } from 'utils'

export const deleteCustomDomainQuery = async (
  workspaceId: string,
  customDomain: string
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/customDomains/${customDomain}?${stringify({ workspaceId })}`,
    method: 'DELETE',
  })
