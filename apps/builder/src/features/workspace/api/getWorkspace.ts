import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { workspaceSchema } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { datesAreOnSameDay } from "@/helpers/datesAreOnSameDate";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { getUserModeInWorkspace } from "../helpers/getUserRoleInWorkspace";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

const inAppWorkspaceSchema = workspaceSchema.omit({
  chatsLimitFirstEmailSentAt: true,
  chatsLimitSecondEmailSentAt: true,
  storageLimitFirstEmailSentAt: true,
  storageLimitSecondEmailSentAt: true,
  customStorageLimit: true,
  additionalChatsIndex: true,
  additionalStorageIndex: true,
  isQuarantined: true,
});

export const getWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: "GET",
      path: "/v1/workspaces/{workspaceId}",
      protect: true,
      summary: "Get workspace",
      tags: ["Workspace"],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          "[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)",
        ),
    }),
  )
  .output(
    z.object({
      workspace: inAppWorkspaceSchema,
      currentUserMode: z.enum(["read", "write", "guest"]),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
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
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    return {
      workspace: inAppWorkspaceSchema.parse(workspace),
      currentUserMode: getUserModeInWorkspace(user.id, workspace.members),
    };
  });
