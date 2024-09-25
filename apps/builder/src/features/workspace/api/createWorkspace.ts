import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import {
  type Workspace,
  workspaceSchema,
} from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";
import { parseWorkspaceDefaultPlan } from "../helpers/parseWorkspaceDefaultPlan";

export const createWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/workspaces",
      protect: true,
      summary: "Create workspace",
      tags: ["Workspace"],
    },
  })
  .input(z.object({ icon: z.string().optional(), name: z.string() }))
  .output(
    z.object({
      workspace: workspaceSchema.omit({
        chatsLimitFirstEmailSentAt: true,
        chatsLimitSecondEmailSentAt: true,
        storageLimitFirstEmailSentAt: true,
        storageLimitSecondEmailSentAt: true,
        customChatsLimit: true,
        customSeatsLimit: true,
        customStorageLimit: true,
        additionalChatsIndex: true,
        additionalStorageIndex: true,
        isQuarantined: true,
      }),
    }),
  )
  .mutation(async ({ input: { name, icon }, ctx: { user } }) => {
    const existingWorkspaceNames = (await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      select: { name: true },
    })) as Pick<Workspace, "name">[];

    if (existingWorkspaceNames.some((workspace) => workspace.name === name))
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Workspace with same name already exists",
      });

    const plan = parseWorkspaceDefaultPlan(user.email ?? "");

    const newWorkspace = (await prisma.workspace.create({
      data: {
        name,
        icon,
        members: { create: [{ role: "ADMIN", userId: user.id }] },
        plan,
      },
    })) as Workspace;

    await trackEvents([
      {
        name: "Workspace created",
        workspaceId: newWorkspace.id,
        userId: user.id,
        data: {
          name,
          plan,
        },
      },
    ]);

    return {
      workspace: newWorkspace,
    };
  });
