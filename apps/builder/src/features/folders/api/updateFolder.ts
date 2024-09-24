import { getUserRoleInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { Plan, WorkspaceRole } from "@typebot.io/prisma/enum";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { z } from "@typebot.io/zod";

export const updateFolder = authenticatedProcedure
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/folders/{folderId}",
      protect: true,
      summary: "Update a folder",
      tags: ["Folder"],
    },
  })
  .input(
    z.object({
      folderId: z.string(),
      workspaceId: z.string(),
      folder: folderSchema
        .pick({
          name: true,
          parentFolderId: true,
        })
        .partial(),
    }),
  )
  .output(
    z.object({
      folder: folderSchema,
    }),
  )
  .mutation(
    async ({ input: { folder, folderId, workspaceId }, ctx: { user } }) => {
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

      if (workspace.plan === Plan.FREE)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You need to upgrade to a paid plan to update folders",
        });

      const updatedFolder = await prisma.dashboardFolder.update({
        where: {
          id: folderId,
        },
        data: {
          name: folder.name,
          parentFolderId: folder.parentFolderId,
        },
      });

      return { folder: folderSchema.parse(updatedFolder) };
    },
  );
