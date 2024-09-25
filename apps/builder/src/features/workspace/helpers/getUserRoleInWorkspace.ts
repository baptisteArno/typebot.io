import type { Prisma } from "@typebot.io/prisma/types";

export const getUserRoleInWorkspace = (
  userId: string,
  workspaceMembers: Prisma.MemberInWorkspace[] | undefined,
) => workspaceMembers?.find((member) => member.userId === userId)?.role;
