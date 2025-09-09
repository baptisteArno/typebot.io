import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import {
  type ThemeTemplate,
  themeTemplateSchema,
} from "@typebot.io/theme/schemas";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const saveThemeTemplate = authenticatedProcedure
  .meta({
    openapi: {
      method: "PUT",
      path: "/v1/themeTemplates/{themeTemplateId}",
      protect: true,
      summary: "Save theme template",
      tags: ["Theme template"],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      themeTemplateId: z.string(),
      name: themeTemplateSchema.shape.name,
      theme: themeTemplateSchema.shape.theme,
    }),
  )
  .output(
    z.object({
      themeTemplate: themeTemplateSchema,
    }),
  )
  .mutation(
    async ({
      input: { themeTemplateId, workspaceId, ...data },
      ctx: { user },
    }) => {
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

      const themeTemplate = (await prisma.themeTemplate.upsert({
        where: { id: themeTemplateId },
        create: {
          ...data,
          workspaceId,
        },
        update: data,
      })) as ThemeTemplate;

      return {
        themeTemplate,
      };
    },
  );
