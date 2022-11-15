import { Workspace } from 'db'
import { sendRequest } from 'utils'

export const updateWorkspaceQuery = async (updates: Partial<Workspace>) =>
  sendRequest<{
    workspace: Workspace
  }>({
    url: `/api/workspaces/${updates.id}`,
    method: 'PATCH',
    body: updates,
  })
