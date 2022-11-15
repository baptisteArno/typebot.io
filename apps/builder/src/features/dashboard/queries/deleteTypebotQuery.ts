import { sendRequest } from 'utils'

export const deleteTypebotQuery = async (id: string) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'DELETE',
  })
