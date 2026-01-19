import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

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
};
