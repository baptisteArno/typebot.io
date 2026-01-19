import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const updateFolderInputSchema = z.object({
  folderId: z.string(),
  workspaceId: z.string(),
  folder: folderSchema
    .pick({
      name: true,
      parentFolderId: true,
    })
    .partial(),
});

export const handleUpdateFolder = async ({
  input: { folder, folderId, workspaceId },
  context: { user },
}: {
  input: z.infer<typeof updateFolderInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: { id: true, members: true, plan: true },
  });
  const userRole = getUserModeInWorkspace(user.id, workspace?.members);
  if (userRole === "guest" || !workspace)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  if (workspace.plan === Plan.FREE)
    throw new ORPCError("FORBIDDEN", {
      message: "You need to upgrade to a paid plan to update folders",
    });

  const updatedFolder = await prisma.dashboardFolder.update({
    where: {
      id: folderId,
      workspaceId,
    },
    data: {
      name: folder.name,
      parentFolderId: folder.parentFolderId,
    },
  });

  return { folder: folderSchema.parse(updatedFolder) };
};
