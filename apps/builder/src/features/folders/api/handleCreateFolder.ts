import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import type { Prisma } from "@typebot.io/prisma/types";
import { folderSchema } from "@typebot.io/schemas/features/folder";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "@/features/workspace/helpers/getUserRoleInWorkspace";

export const createFolderInputSchema = z.object({
  workspaceId: z.string(),
  folderName: z.string().default(""),
  parentFolderId: z.string().optional(),
});

export const handleCreateFolder = async ({
  input: { folderName, parentFolderId, workspaceId },
  context: { user },
}: {
  input: z.infer<typeof createFolderInputSchema>;
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
      message: "You need to upgrade to a paid plan to create folders",
    });

  const newFolder = await prisma.dashboardFolder.create({
    data: {
      workspaceId,
      name: folderName,
      parentFolderId,
    } satisfies Partial<Prisma.DashboardFolder>,
  });

  await trackEvents([
    {
      name: "Folder created",
      userId: user.id,
      workspaceId,
    },
  ]);

  return { folder: folderSchema.parse(newFolder) };
};
