import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const deleteThemeTemplateInputSchema = z.object({
  workspaceId: z.string(),
  themeTemplateId: z.string(),
});

export const handleDeleteThemeTemplate = async ({
  input: { themeTemplateId, workspaceId },
  context: { user },
}: {
  input: z.infer<typeof deleteThemeTemplateInputSchema>;
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

  const themeTemplate = await prisma.themeTemplate.findFirst({
    where: {
      id: themeTemplateId,
      workspaceId,
    },
  });

  if (!themeTemplate)
    throw new ORPCError("NOT_FOUND", { message: "Theme template not found" });

  await prisma.themeTemplate.deleteMany({
    where: {
      id: themeTemplateId,
      workspaceId,
    },
  });

  return {
    themeTemplate: themeTemplate as ThemeTemplate,
  };
};
