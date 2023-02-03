import { CollaboratorsOnTypebots } from 'db'
import { sendRequest } from 'utils'

export const updateCollaboratorQuery = (
  typebotId: string,
  userId: string,
  collaborator: Omit<CollaboratorsOnTypebots, 'createdAt' | 'updatedAt'>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/typebots/${typebotId}/collaborators/${userId}`,
    body: collaborator,
  })
