import { MemberInWorkspace } from '@sniper.io/prisma'

export const getUserRoleInWorkspace = (
  userId: string,
  workspaceMembers: MemberInWorkspace[] | undefined
) => workspaceMembers?.find((member) => member.userId === userId)?.role
