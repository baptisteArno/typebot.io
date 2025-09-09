import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import {
  type ThemeTemplate,
  themeTemplateSchema,
} from "@typebot.io/theme/schemas";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const deleteThemeTemplate = authenticatedProcedure
  .meta({
    openapi: {
      method: "DELETE",
      path: "/v1/themeTemplates/{themeTemplateId}",
      protect: true,
      summary: "Delete a theme template",
      tags: ["Theme template"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      themeTemplateId: z.string(),
    }),
  )
  .output(
    z.object({
      themeTemplate: themeTemplateSchema,
    }),
  )
  .mutation(
    async ({ input: { themeTemplateId, workspaceId }, ctx: { user } }) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          members: true,
        },
      });
      const userRole = getUserModeInWorkspace(user.id, workspace?.members);
      if (userRole === "guest")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      const themeTemplate = (await prisma.themeTemplate.delete({
        where: {
          id: themeTemplateId,
        },
      })) as ThemeTemplate;

      return {
        themeTemplate,
      };
    },
  );
