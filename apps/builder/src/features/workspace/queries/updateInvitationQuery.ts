import { WorkspaceInvitation } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const updateInvitationQuery = (
  invitation: Partial<WorkspaceInvitation>
) =>
  sendRequest({
    url: `/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'PATCH',
    body: invitation,
  })
