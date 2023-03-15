import { Credentials } from '@typebot.io/prisma'
import { stringify } from 'qs'
import { sendRequest } from '@typebot.io/lib'

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
