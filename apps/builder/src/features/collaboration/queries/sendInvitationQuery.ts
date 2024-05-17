import { CollaborationType } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const sendInvitationQuery = (
  typebotId: string,
  { email, type }: { email: string; type: CollaborationType }
) =>
  sendRequest({
    method: 'POST',
    url: `/api/eddies/${typebotId}/invitations`,
    body: { email, type },
  })
