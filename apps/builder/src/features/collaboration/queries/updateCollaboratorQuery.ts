import { CollaboratorsOnSnipers } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'

export const updateCollaboratorQuery = (
  sniperId: string,
  userId: string,
  collaborator: Omit<CollaboratorsOnSnipers, 'createdAt' | 'updatedAt'>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/snipers/${sniperId}/collaborators/${userId}`,
    body: collaborator,
  })
