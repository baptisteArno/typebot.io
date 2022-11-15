import { Workspace } from 'db'
import { sendRequest } from 'utils'

export const createWorkspaceQuery = async (
  body: Omit<
    Workspace,
    | 'id'
    | 'icon'
    | 'createdAt'
    | 'stripeId'
    | 'additionalChatsIndex'
    | 'additionalStorageIndex'
    | 'chatsLimitFirstEmailSentAt'
    | 'chatsLimitSecondEmailSentAt'
    | 'storageLimitFirstEmailSentAt'
    | 'storageLimitSecondEmailSentAt'
    | 'customChatsLimit'
    | 'customStorageLimit'
    | 'customSeatsLimit'
  >
) =>
  sendRequest<{
    workspace: Workspace
  }>({
    url: `/api/workspaces`,
    method: 'POST',
    body,
  })
