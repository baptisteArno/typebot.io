import { MemberInWorkspace, WorkspaceRole } from '@typebot.io/prisma'
import { env } from '@typebot.io/env'

export const getUserRoleInWorkspace = (
  userId: string,
  workspaceMembers: MemberInWorkspace[] | undefined,
  userEmail?: string
) => {
  // Check if user is super admin
  if (userEmail && env.ADMIN_EMAIL?.some((email) => email === userEmail)) {
    return WorkspaceRole.ADMIN
  }

  // Check normal membership
  return workspaceMembers?.find((member) => member.userId === userId)?.role
}
