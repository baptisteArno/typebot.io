import { sendRequest } from '@typebot.io/lib'

export const deleteInvitationQuery = (typebotId: string, email: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/typebots/${typebotId}/invitations/${email}`,
  })
