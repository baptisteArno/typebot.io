import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { isWriteTypebotForbidden } from "@/features/typebot/helpers/isWriteTypebotForbidden";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const getAuthorizedGoogleSheetsOAuthResources = async ({
  workspaceId,
  typebotId,
  user,
}: {
  workspaceId: string;
  typebotId?: string;
  user: Pick<User, "id">;
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
    select: {
      id: true,
      members: { select: { userId: true, role: true } },
    },
  });

  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  if (!typebotId) return { workspace, typebot: null };

  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
      workspaceId,
    },
    select: {
      version: true,
      groups: true,
      workspace: {
        select: {
          isSuspended: true,
          isPastDue: true,
          members: {
            select: {
              userId: true,
              role: true,
            },
          },
        },
      },
      collaborators: {
        select: {
          userId: true,
          type: true,
        },
      },
    },
  });

  if (!typebot || (await isWriteTypebotForbidden(typebot, user)))
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  return { workspace, typebot };
};
