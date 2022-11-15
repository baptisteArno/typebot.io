import { MemberInWorkspace } from 'db'
import { sendRequest } from 'utils'

export const updateMemberQuery = (
  workspaceId: string,
  member: Partial<MemberInWorkspace>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/workspaces/${workspaceId}/members/${member.userId}`,
    body: member,
  })
