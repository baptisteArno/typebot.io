import { Workspace } from 'db'
import { sendRequest } from 'utils'

export const deleteWorkspaceQuery = (workspaceId: string) =>
  sendRequest<{
    workspace: Workspace
  }>({
    url: `/api/workspaces/${workspaceId}`,
    method: 'DELETE',
  })
