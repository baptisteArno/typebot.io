import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const deleteFolderInputSchema = z.object({
  folderId: z.string(),
  workspaceId: z.string(),
});

export const handleDeleteFolder = async ({
  input: { folderId, workspaceId },
  context: { user },
}: {
  input: z.infer<typeof deleteFolderInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, members: true, plan: true },
  });
  const userRole = getUserModeInWorkspace(user.id, workspace?.members);
  if (userRole === "guest" || !workspace)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const folder = await prisma.dashboardFolder.delete({
    where: {
      id: folderId,
      workspaceId,
    },
  });

  return { folder };
};
