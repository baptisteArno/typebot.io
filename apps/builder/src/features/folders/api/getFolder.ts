import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const getFolder = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/folders/{folderId}",
      protect: true,
      summary: "Get folder",
      tags: ["Folder"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      folderId: z.string(),
    }),
  )
  .output(
    z.object({
      folder: folderSchema,
    }),
  )
  .query(async ({ input: { workspaceId, folderId }, ctx: { user } }) => {
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

    const folder = await prisma.dashboardFolder.findUnique({
      where: {
        id: folderId,
        workspaceId,
      },
    });

    if (!folder)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Folder not found",
      });

    return { folder };
  });
