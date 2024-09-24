import type { Prisma } from "@typebot.io/prisma/types";

export const isAdminWriteWorkspaceForbidden = (
  workspace: {
    members: Pick<Prisma.MemberInWorkspace, "role" | "userId">[];
  },
  user: Pick<Prisma.User, "email" | "id">,
) => {
  const userRole = workspace.members.find(
    (member) => member.userId === user.id,
  )?.role;
  return !userRole || userRole !== "ADMIN";
};
