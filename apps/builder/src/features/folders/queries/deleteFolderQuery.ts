import { sendRequest } from '@typebot.io/lib'

export const deleteFolderQuery = async (id: string) =>
  sendRequest({
    url: `/api/folders/${id}`,
    method: 'DELETE',
  })
