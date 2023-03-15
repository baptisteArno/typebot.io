import { sendRequest } from '@typebot.io/lib'

export const deleteTypebotQuery = async (id: string) =>
  sendRequest({
    url: `/api/typebots/${id}`,
    method: 'DELETE',
  })
