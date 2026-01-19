import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { User } from "@typebot.io/user/schemas";
import { parseWorkspaceDefaultPlan } from "@typebot.io/workspaces/parseWorkspaceDefaultPlan";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { z } from "zod";

const MAX_FREE_WORKSPACES_PER_USER = 2;
const WORKSPACE_CREATION_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export const createWorkspaceInputSchema = z.object({
  icon: z.string().optional(),
  name: z.string(),
});

export const handleCreateWorkspace = async ({
  input: { name, icon },
  context: { user },
}: {
  input: z.infer<typeof createWorkspaceInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const plan = parseWorkspaceDefaultPlan(user.email);

  if (plan === "FREE") await enforceFreeTierLimits(user.id);

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
    throw new ORPCError("BAD_REQUEST", {
      message: "Workspace with same name already exists",
    });

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
    },
  ]);

  return {
    workspace: newWorkspace,
  };
};

const enforceFreeTierLimits = async (userId: string) => {
  const ownedFreeWorkspaces = await prisma.workspace.findMany({
    where: {
      plan: "FREE",
      members: {
        some: {
          userId,
          role: "ADMIN",
        },
      },
    },
    select: {
      members: {
        where: { userId, role: "ADMIN" },
        select: { createdAt: true },
        take: 1,
      },
    },
  });

  if (ownedFreeWorkspaces.length >= MAX_FREE_WORKSPACES_PER_USER)
    throw new ORPCError("FORBIDDEN", {
      message: `You can only have ${MAX_FREE_WORKSPACES_PER_USER} free workspaces. Please upgrade to create more.`,
    });

  const mostRecentMembership = ownedFreeWorkspaces
    .flatMap((w) => w.members)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  if (
    mostRecentMembership &&
    Date.now() - mostRecentMembership.createdAt.getTime() <
      WORKSPACE_CREATION_COOLDOWN_MS
  )
    throw new ORPCError("TOO_MANY_REQUESTS", {
      message: "Please wait 24 hours before creating another workspace.",
    });
};
