import { DashboardFolder } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const updateFolderQuery = async (
  id: string,
  folder: Partial<DashboardFolder>
) =>
  sendRequest({
    url: `/api/folders/${id}`,
    method: 'PATCH',
    body: folder,
  })
