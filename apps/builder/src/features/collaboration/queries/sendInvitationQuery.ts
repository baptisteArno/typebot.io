import { CollaborationType } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'

export const sendInvitationQuery = (
  sniperId: string,
  { email, type }: { email: string; type: CollaborationType }
) =>
  sendRequest({
    method: 'POST',
    url: `/api/snipers/${sniperId}/invitations`,
    body: { email, type },
  })
