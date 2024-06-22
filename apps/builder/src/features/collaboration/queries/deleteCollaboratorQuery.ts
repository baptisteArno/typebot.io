import { sendRequest } from '@sniper.io/lib'

export const deleteCollaboratorQuery = (sniperId: string, userId: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/snipers/${sniperId}/collaborators/${userId}`,
  })
