import { CollaborationType } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";

export const isWriteTypebotForbidden = async (
  typebot: {
    collaborators: Pick<Prisma.CollaboratorsOnTypebots, "userId" | "type">[];
  } & {
    workspace: Pick<Prisma.Workspace, "isSuspended" | "isPastDue"> & {
      members: Pick<Prisma.MemberInWorkspace, "userId" | "role">[];
    };
  },
  user: Pick<Prisma.User, "id">,
) => {
  return (
    typebot.workspace.isSuspended ||
    typebot.workspace.isPastDue ||
    (!typebot.collaborators.some(
      (collaborator) =>
        collaborator.userId === user.id &&
        collaborator.type === CollaborationType.WRITE,
    ) &&
      !typebot.workspace.members.some(
        (m) => m.userId === user.id && m.role !== "GUEST",
      ))
  );
};
