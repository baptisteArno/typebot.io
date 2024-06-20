import { Invitation } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'

export const updateInvitationQuery = (
  sniperId: string,
  email: string,
  invitation: Omit<Invitation, 'createdAt' | 'id' | 'updatedAt'>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/snipers/${sniperId}/invitations/${email}`,
    body: invitation,
  })
