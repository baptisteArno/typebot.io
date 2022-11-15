import { sendRequest } from 'utils'

export const deleteFolderQuery = async (id: string) =>
  sendRequest({
    url: `/api/folders/${id}`,
    method: 'DELETE',
  })
