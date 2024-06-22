import { MemberInWorkspace } from '@sniper.io/prisma'
import { sendRequest } from '@sniper.io/lib'

export const updateMemberQuery = (
  workspaceId: string,
  member: Partial<MemberInWorkspace>
) =>
  sendRequest({
    method: 'PATCH',
    url: `/api/workspaces/${workspaceId}/members/${member.userId}`,
    body: member,
  })
