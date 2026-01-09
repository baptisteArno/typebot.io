import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import prisma from "@typebot.io/prisma";
import {
  type ThemeTemplate,
  themeTemplateSchema,
} from "@typebot.io/theme/schemas";
import { z } from "@typebot.io/zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const deleteThemeTemplate = authenticatedProcedure
  .route({
    method: "DELETE",
    path: "/v1/themeTemplates/{themeTemplateId}",
    summary: "Delete a theme template",
    tags: ["Theme template"],
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
  .handler(
    async ({ input: { themeTemplateId, workspaceId }, context: { user } }) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          members: true,
        },
      });
      const userRole = getUserModeInWorkspace(user.id, workspace?.members);
      if (userRole === "guest")
        throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

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
