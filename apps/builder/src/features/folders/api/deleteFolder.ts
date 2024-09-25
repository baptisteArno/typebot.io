import { getUserRoleInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "@typebot.io/zod";

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
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members);
    if (
      userRole === undefined ||
      userRole === WorkspaceRole.GUEST ||
      !workspace
    )
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
