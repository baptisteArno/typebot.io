import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import {
  workspaceAiFeatureSchema,
  workspaceSchema,
} from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { isReadWorkspaceFobidden } from "../helpers/isReadWorkspaceFobidden";

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
      workspace: workspaceSchema
        .omit({
          chatsLimitFirstEmailSentAt: true,
          chatsLimitSecondEmailSentAt: true,
          storageLimitFirstEmailSentAt: true,
          storageLimitSecondEmailSentAt: true,
          customStorageLimit: true,
          additionalChatsIndex: true,
          additionalStorageIndex: true,
          isQuarantined: true,
        })
        .extend({
          aiFeatures: z.array(workspaceAiFeatureSchema).optional(),
        }),
    }),
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: {
        members: true,
        aiFeatures: {
          select: {
            id: true,
            prompt: true,
            credentialId: true,
          },
        },
      },
    });

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No workspaces found",
      });

    return {
      workspace,
    };
  });
