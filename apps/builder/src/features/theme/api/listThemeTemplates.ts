import { getUserRoleInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { WorkspaceRole } from "@typebot.io/prisma/enum";
import {
  type ThemeTemplate,
  themeTemplateSchema,
} from "@typebot.io/theme/schemas";
import { z } from "@typebot.io/zod";

export const listThemeTemplates = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/themeTemplates",
      protect: true,
      summary: "List theme templates",
      tags: ["Theme template"],
    },
  })
  .input(z.object({ workspaceId: z.string() }))
  .output(
    z.object({
      themeTemplates: z.array(
        themeTemplateSchema.pick({
          id: true,
          name: true,
          theme: true,
        }),
      ),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        members: true,
      },
    });
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members);
    if (userRole === undefined || userRole === WorkspaceRole.GUEST)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });
    const themeTemplates = (await prisma.themeTemplate.findMany({
      where: {
        workspaceId,
      },
      select: {
        id: true,
        name: true,
        theme: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as Pick<ThemeTemplate, "id" | "name" | "theme">[];

    return { themeTemplates };
  });
