import { sendRequest } from '@typebot.io/lib'

export const deleteInvitationQuery = (typebotId: string, email: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/eddies/${typebotId}/invitations/${email}`,
  })
