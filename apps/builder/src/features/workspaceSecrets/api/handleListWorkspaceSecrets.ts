import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const listWorkspaceSecretsInputSchema = z.object({
  workspaceId: z.string(),
});

export const workspaceSecretListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const handleListWorkspaceSecrets = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof listWorkspaceSecretsInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: input.workspaceId },
    select: { id: true, members: { select: { userId: true, role: true } } },
  });
  if (!workspace || isReadWorkspaceFobidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const secrets = await prisma.workspaceSecret.findMany({
    where: { workspaceId: input.workspaceId },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
    orderBy: { name: "asc" },
  });
  return { secrets };
};
