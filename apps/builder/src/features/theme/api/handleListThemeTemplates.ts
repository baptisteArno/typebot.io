import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { ThemeTemplate } from "@typebot.io/theme/schemas";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const listThemeTemplatesInputSchema = z.object({
  workspaceId: z.string(),
});

export const handleListThemeTemplates = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: z.infer<typeof listThemeTemplatesInputSchema>;
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
};
