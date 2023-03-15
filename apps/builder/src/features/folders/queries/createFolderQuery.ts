import { DashboardFolder } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const createFolderQuery = async (
  workspaceId: string,
  folder: Pick<DashboardFolder, 'parentFolderId'>
) =>
  sendRequest<DashboardFolder>({
    url: `/api/folders`,
    method: 'POST',
    body: { ...folder, workspaceId },
  })
