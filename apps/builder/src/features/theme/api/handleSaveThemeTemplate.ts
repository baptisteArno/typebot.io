import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import {
  type ThemeTemplate,
  themeTemplateSchema,
} from "@typebot.io/theme/schemas";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

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
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      members: true,
    },
  });
  const userRole = getUserModeInWorkspace(user.id, workspace?.members);
  if (userRole === "guest")
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

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
};
