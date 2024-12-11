import type { Prisma } from "@typebot.io/prisma/types";

export const getUserRoleInWorkspace = (
  userId: string,
  workspaceMembers:
    | Pick<Prisma.MemberInWorkspace, "userId" | "role">[]
    | undefined,
) => workspaceMembers?.find((member) => member.userId === userId)?.role;
