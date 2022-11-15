import { DashboardFolder } from 'db'
import { sendRequest } from 'utils'

export const createFolderQuery = async (
  workspaceId: string,
  folder: Pick<DashboardFolder, 'parentFolderId'>
) =>
  sendRequest<DashboardFolder>({
    url: `/api/folders`,
    method: 'POST',
    body: { ...folder, workspaceId },
  })
