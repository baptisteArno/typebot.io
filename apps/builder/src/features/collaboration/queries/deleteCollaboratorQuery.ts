import { sendRequest } from '@typebot.io/lib'

export const deleteCollaboratorQuery = (typebotId: string, userId: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/eddies/${typebotId}/collaborators/${userId}`,
  })
