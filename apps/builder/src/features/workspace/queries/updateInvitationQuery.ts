import { WorkspaceInvitation } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'

export const updateInvitationQuery = (
  invitation: Partial<WorkspaceInvitation>
) =>
  sendRequest({
    url: `/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'PATCH',
    body: invitation,
  })
