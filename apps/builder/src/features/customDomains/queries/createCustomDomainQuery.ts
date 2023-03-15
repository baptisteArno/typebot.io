import { CustomDomain, Credentials } from '@typebot.io/prisma'
import { stringify } from 'qs'
import { sendRequest } from '@typebot.io/lib'

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
