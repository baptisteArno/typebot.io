import { getUserRoleInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "@typebot.io/zod";

export const listFolders = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/folders",
      protect: true,
      summary: "List folders",
      tags: ["Folder"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      parentFolderId: z.string().optional(),
    }),
  )
  .output(
    z.object({
      folders: z.array(folderSchema),
    }),
  )
  .query(async ({ input: { workspaceId, parentFolderId }, ctx: { user } }) => {
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
  });
