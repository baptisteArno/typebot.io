import { DashboardFolder } from 'db'
import { sendRequest } from 'utils'

export const updateFolderQuery = async (
  id: string,
  folder: Partial<DashboardFolder>
) =>
  sendRequest({
    url: `/api/folders/${id}`,
    method: 'PATCH',
    body: folder,
  })
