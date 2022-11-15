import { WorkspaceInvitation } from 'db'
import { sendRequest } from 'utils'
import { Member } from '../types'

export const sendInvitationQuery = (
  invitation: Omit<WorkspaceInvitation, 'id' | 'createdAt'>
) =>
  sendRequest<{ invitation?: WorkspaceInvitation; member?: Member }>({
    url: `/api/workspaces/${invitation.workspaceId}/invitations`,
    method: 'POST',
    body: invitation,
  })
