import { CollaborationType } from 'db'
import { sendRequest } from 'utils'

export const sendInvitationQuery = (
  typebotId: string,
  { email, type }: { email: string; type: CollaborationType }
) =>
  sendRequest({
    method: 'POST',
    url: `/api/typebots/${typebotId}/invitations`,
    body: { email, type },
  })
