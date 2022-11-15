import { CollaboratorsOnTypebots } from 'db'
import { sendRequest } from 'utils'

export const updateCollaboratorQuery = (
  typebotId: string,
  userId: string,
  collaborator: CollaboratorsOnTypebots
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/typebots/${typebotId}/collaborators/${userId}`,
    body: collaborator,
  })
