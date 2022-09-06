import { WorkspaceInvitation } from 'model'
import { sendRequest } from 'utils'
import { Member } from './member'

export const sendInvitation = (
  invitation: Omit<WorkspaceInvitation, 'id' | 'createdAt'>
) =>
  sendRequest<{ invitation?: WorkspaceInvitation; member?: Member }>({
    url: `${process.env.BASE_PATH || ''}/api/workspaces/${invitation.workspaceId}/invitations`,
    method: 'POST',
    body: invitation,
  })

export const updateInvitation = (invitation: Partial<WorkspaceInvitation>) =>
  sendRequest({
    url: `${process.env.BASE_PATH || ''}/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'PATCH',
    body: invitation,
  })

export const deleteInvitation = (invitation: {
  workspaceId: string
  id: string
}) =>
  sendRequest({
    url: `${process.env.BASE_PATH || ''}/api/workspaces/${invitation.workspaceId}/invitations/${invitation.id}`,
    method: 'DELETE',
  })
