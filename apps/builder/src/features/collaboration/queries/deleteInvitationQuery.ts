import { sendRequest } from '@sniper.io/lib'

export const deleteInvitationQuery = (sniperId: string, email: string) =>
  sendRequest({
    method: 'DELETE',
    url: `/api/snipers/${sniperId}/invitations/${email}`,
  })
