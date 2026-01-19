import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const getFolderInputSchema = z.object({
  workspaceId: z.string(),
  folderId: z.string(),
});

export const handleGetFolder = async ({
  input: { workspaceId, folderId },
  context: { user },
}: {
  input: z.infer<typeof getFolderInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, members: true, plan: true },
  });
  const userRole = getUserModeInWorkspace(user.id, workspace?.members);
  if (userRole === "guest" || !workspace)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const folder = await prisma.dashboardFolder.findUnique({
    where: {
      id: folderId,
      workspaceId,
    },
  });

  if (!folder)
    throw new ORPCError("NOT_FOUND", { message: "Folder not found" });

  return { folder };
};
