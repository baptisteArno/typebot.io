import { ORPCError } from "@orpc/server";
import { datesAreOnSameDay } from "@typebot.io/lib/datesAreOnSameDay";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "zod";
import { getUserModeInWorkspace } from "../helpers/getUserRoleInWorkspace";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

const memberWorkspaceSchema = workspaceSchema.omit({
  chatsLimitFirstEmailSentAt: true,
  chatsLimitSecondEmailSentAt: true,
  storageLimitFirstEmailSentAt: true,
  storageLimitSecondEmailSentAt: true,
  customStorageLimit: true,
  additionalChatsIndex: true,
  additionalStorageIndex: true,
  isQuarantined: true,
});

// Guests need navigation and bot availability context, not workspace billing data.
const guestWorkspaceSchema = memberWorkspaceSchema.pick({
  id: true,
  name: true,
  icon: true,
  plan: true,
  isSuspended: true,
  isPastDue: true,
  isVerified: true,
});

export const inAppWorkspaceSchema = z.union([
  memberWorkspaceSchema,
  guestWorkspaceSchema,
]);

export type InAppWorkspace = z.infer<typeof guestWorkspaceSchema> &
  Partial<z.infer<typeof memberWorkspaceSchema>>;

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

  if (!workspace)
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  if (isReadWorkspaceFobidden(workspace, user)) {
    if (
      !workspace.members.some(
        (member) => member.userId === user.id && member.role === "GUEST",
      )
    )
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    return {
      workspace: guestWorkspaceSchema.parse(workspace),
      currentUserMode: z.literal("guest").parse("guest"),
    };
  }

  if (
    !workspace.lastActivityAt ||
    !datesAreOnSameDay(workspace.lastActivityAt, new Date())
  ) {
    await prisma.workspace.updateMany({
      where: { id: workspaceId },
      data: {
        lastActivityAt: new Date(),
      },
    });
  }

  const currentUserMode = getUserModeInWorkspace(user.id, workspace.members);

  return {
    workspace: memberWorkspaceSchema.parse(workspace),
    currentUserMode: z.enum(["read", "write", "guest"]).parse(currentUserMode),
  };
};
