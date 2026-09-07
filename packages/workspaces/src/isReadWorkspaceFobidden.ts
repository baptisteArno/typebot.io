import { env } from "@typebot.io/env";
import type { Prisma } from "@typebot.io/prisma/types";

export const isReadWorkspaceFobidden = (
  workspace: {
    members: Pick<Prisma.MemberInWorkspace, "userId" | "role">[];
  },
  user: Pick<Prisma.User, "email" | "id">,
) => {
  if (
    env.ADMIN_EMAIL?.some((email) => email === user.email) ||
    workspace.members.some(
      (member) =>
        member.userId === user.id &&
        (member.role === "ADMIN" || member.role === "MEMBER"),
    )
  )
    return false;
  return true;
};
