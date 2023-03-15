import { MemberInWorkspace } from '@typebot.io/prisma'
import { sendRequest } from '@typebot.io/lib'

export const updateMemberQuery = (
  workspaceId: string,
  member: Partial<MemberInWorkspace>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/workspaces/${workspaceId}/members/${member.userId}`,
    body: member,
  })
