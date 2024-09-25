import type { Prisma } from "@typebot.io/prisma/types";

export const isWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<Prisma.MemberInWorkspace, "userId" | "role">[];
  },
  user: Pick<Prisma.User, "id">,
) => {
  const userRole = workspace.members.find(
    (member) => member.userId === user.id,
  )?.role;
  return !userRole || userRole === "GUEST";
};
