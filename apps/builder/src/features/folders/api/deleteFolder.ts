import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const deleteFolder = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/folders/{folderId}",
      protect: true,
      summary: "Delete a folder",
      tags: ["Folder"],
    },
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
  .mutation(async ({ input: { folderId, workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, members: true, plan: true },
    });
    const userRole = getUserModeInWorkspace(user.id, workspace?.members);
    if (userRole === "guest" || !workspace)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const folder = await prisma.dashboardFolder.delete({
      where: {
        id: folderId,
      },
    });

    return { folder };
  });
