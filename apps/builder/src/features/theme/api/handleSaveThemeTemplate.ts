import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import {
  type ThemeTemplate,
  themeTemplateSchema,
} from "@typebot.io/theme/schemas";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const saveThemeTemplateInputSchema = z.object({
  workspaceId: z.string(),
  themeTemplateId: z.string(),
  name: themeTemplateSchema.shape.name,
  theme: themeTemplateSchema.shape.theme,
});

export const handleSaveThemeTemplate = async ({
  input: { themeTemplateId, workspaceId, ...data },
  context: { user },
}: {
  input: z.infer<typeof saveThemeTemplateInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    select: {
      members: {
        select: {
          userId: true,
          role: true,
        },
      },
    },
  });

  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const existingThemeTemplate = await prisma.themeTemplate.findFirst({
    where: {
      id: themeTemplateId,
      workspaceId,
    },
  });

  const themeTemplate = (
    existingThemeTemplate
      ? await prisma.themeTemplate.update({
          where: { id: themeTemplateId },
          data,
        })
      : await prisma.themeTemplate.create({
          data: {
            ...data,
            workspaceId,
          },
        })
  ) as ThemeTemplate;

  return {
    themeTemplate,
  };
};
