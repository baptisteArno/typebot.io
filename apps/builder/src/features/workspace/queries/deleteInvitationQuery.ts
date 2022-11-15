import { sendRequest } from 'utils'

export const deleteInvitationQuery = (invitation: {
  workspaceId: string
  id: string
}) =>
  sendRequest({
    url: `/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'DELETE',
  })
