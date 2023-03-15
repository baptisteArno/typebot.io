import { Invitation } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const updateInvitationQuery = (
  typebotId: string,
  email: string,
  invitation: Omit<Invitation, 'createdAt' | 'id' | 'updatedAt'>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/typebots/${typebotId}/invitations/${email}`,
    body: invitation,
  })
