import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import type { User } from "@typebot.io/user/schemas";
import { parseWorkspaceDefaultPlan } from "@typebot.io/workspaces/parseWorkspaceDefaultPlan";
import type { Workspace } from "@typebot.io/workspaces/schemas";
import { z } from "@typebot.io/zod";

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
    },
  ]);

  return {
    workspace: newWorkspace,
  };
};
