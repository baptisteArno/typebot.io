import { WorkspaceInvitation } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'
import { Member } from '../types'

export const sendInvitationQuery = (
  invitation: Omit<WorkspaceInvitation, 'id' | 'createdAt' | 'updatedAt'>
) =>
  sendRequest<{ invitation?: WorkspaceInvitation; member?: Member }>({
    url: `/api/workspaces/${invitation.workspaceId}/invitations`,
    method: 'POST',
    body: invitation,
  })
