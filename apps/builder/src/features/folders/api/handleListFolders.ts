import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const listFoldersInputSchema = z.object({
  workspaceId: z.string(),
  parentFolderId: z.string().optional(),
});

export const handleListFolders = async ({
  input: { workspaceId, parentFolderId },
  context: { user },
}: {
  input: z.infer<typeof listFoldersInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, members: true, plan: true },
  });
  const userRole = getUserModeInWorkspace(user.id, workspace?.members);
  if (userRole === "guest" || !workspace)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const folders = await prisma.dashboardFolder.findMany({
    where: {
      workspaceId,
      parentFolderId: parentFolderId ?? null,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { folders };
};
