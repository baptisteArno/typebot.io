import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { getTypebotAccessRight } from "@typebot.io/typebot/helpers/getTypebotAccessRight";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const listTypebotsInputSchema = z.object({
  workspaceId: z
    .string()
    .describe(
      "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
    ),
  folderId: z.string().optional(),
});

export const handleListTypebots = async ({
  input: { workspaceId, folderId },
  context: { user },
}: {
  input: z.infer<typeof listTypebotsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
  });
  const userRole = getUserModeInWorkspace(user.id, workspace?.members);
  if (!workspace || userRole === undefined)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });
  const typebots = await prisma.typebot.findMany({
    where: {
      isArchived: { not: true },
      folderId:
        userRole === "guest"
          ? undefined
          : folderId === "root"
            ? null
            : folderId,
      workspaceId,
      collaborators:
        userRole === "guest" ? { some: { userId: user.id } } : undefined,
    },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      publishedTypebot: { select: { id: true } },
      id: true,
      icon: true,
      collaborators: { select: { userId: true, type: true } },
    },
  });

  if (!typebots)
    throw new ORPCError("NOT_FOUND", { message: "No typebots found" });

  return {
    typebots: typebots.map((typebot) => ({
      id: typebot.id,
      name: typebot.name,
      icon: typebot.icon,
      publishedTypebotId: typebot.publishedTypebot?.id,
      accessRight: getTypebotAccessRight(user, {
        ...typebot,
        workspace: { members: workspace.members },
      }),
    })),
  };
};
