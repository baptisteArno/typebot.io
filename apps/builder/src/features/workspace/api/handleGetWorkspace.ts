import { ORPCError } from "@orpc/server";
import { datesAreOnSameDay } from "@typebot.io/lib/datesAreOnSameDay";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "../helpers/getUserRoleInWorkspace";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

export const inAppWorkspaceSchema = workspaceSchema.omit({
  chatsLimitFirstEmailSentAt: true,
  chatsLimitSecondEmailSentAt: true,
  storageLimitFirstEmailSentAt: true,
  storageLimitSecondEmailSentAt: true,
  customStorageLimit: true,
  additionalChatsIndex: true,
  additionalStorageIndex: true,
  isQuarantined: true,
});

export const getWorkspaceInputSchema = z.object({
  workspaceId: z
    .string()
    .describe(
      "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
    ),
});

export const handleGetWorkspace = async ({
  input: { workspaceId },
  context: { user },
}: {
  input: z.infer<typeof getWorkspaceInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId },
    include: { members: true },
  });

  if (
    !workspace?.lastActivityAt ||
    !datesAreOnSameDay(workspace.lastActivityAt, new Date())
  ) {
    await prisma.workspace.updateMany({
      where: { id: workspaceId },
      data: {
        lastActivityAt: new Date(),
        inactiveFirstEmailSentAt: null,
        inactiveSecondEmailSentAt: null,
      },
    });
  }

  if (!workspace || isReadWorkspaceFobidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const currentUserMode = getUserModeInWorkspace(user.id, workspace.members);

  return {
    workspace: inAppWorkspaceSchema.parse(workspace),
    currentUserMode: currentUserMode as "read" | "write" | "guest",
  };
};
