import { CustomDomain, Credentials } from 'db'
import { stringify } from 'qs'
import { sendRequest } from 'utils'

export const createCustomDomainQuery = async (
  workspaceId: string,
  customDomain: Omit<CustomDomain, 'createdAt' | 'workspaceId'>
) =>
  sendRequest<{
    credentials: Credentials
  }>({
    url: `/api/customDomains?${stringify({ workspaceId })}`,
    method: 'POST',
    body: customDomain,
  })
