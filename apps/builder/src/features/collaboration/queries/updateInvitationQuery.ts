import { Invitation } from 'db'
import { sendRequest } from 'utils'

export const updateInvitationQuery = (
  typebotId: string,
  email: string,
  invitation: Omit<Invitation, 'createdAt' | 'id'>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/typebots/${typebotId}/invitations/${email}`,
    body: invitation,
  })
