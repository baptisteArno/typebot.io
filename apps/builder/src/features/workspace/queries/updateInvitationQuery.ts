import { WorkspaceInvitation } from 'db'
import { sendRequest } from 'utils'

export const updateInvitationQuery = (
  invitation: Partial<WorkspaceInvitation>
) =>
  sendRequest({
    url: `/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'PATCH',
    body: invitation,
  })
