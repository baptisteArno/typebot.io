import type { Prisma } from "@typebot.io/prisma/types";

export const getUserModeInWorkspace = (
  userId: string,
  workspaceMembers:
    | Pick<Prisma.MemberInWorkspace, "userId" | "role">[]
    | undefined,
) => {
  const role = workspaceMembers?.find(
    (member) => member.userId === userId,
  )?.role;
  if (!role || role === "GUEST") return "guest";
  if (role === "ADMIN") return "write";
  return "read";
};
