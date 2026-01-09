import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const deleteFolder = authenticatedProcedure
  .route({
    method: "DELETE",
    path: "/v1/folders/{folderId}",
    summary: "Delete a folder",
    tags: ["Folder"],
  })
  .input(
    z.object({
      folderId: z.string(),
      workspaceId: z.string(),
    }),
  )
  .output(
    z.object({
      folder: folderSchema,
    }),
  )
  .handler(async ({ input: { folderId, workspaceId }, context: { user } }) => {
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
      },
    });

    return { folder };
  });
