import { WorkspaceInvitation } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'
import { Member } from '../types'

export const sendInvitationQuery = (
  invitation: Omit<WorkspaceInvitation, 'id' | 'createdAt' | 'updatedAt'>
) =>
  sendRequest<{ invitation?: WorkspaceInvitation; member?: Member }>({
    url: `/api/workspaces/${invitation.workspaceId}/invitations`,
    method: 'POST',
    body: invitation,
  })
