import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { encryptSecretValue } from "@typebot.io/workspace-secrets/encryptSecretValue";
import {
  workspaceSecretNameSchema,
  workspaceSecretValueSchema,
} from "@typebot.io/workspace-secrets/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const createWorkspaceSecretInputSchema = z.object({
  workspaceId: z.string(),
  name: workspaceSecretNameSchema,
  value: workspaceSecretValueSchema,
});

export const handleCreateWorkspaceSecret = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof createWorkspaceSecretInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: input.workspaceId },
    select: { id: true, members: { select: { userId: true, role: true } } },
  });
  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const existing = await prisma.workspaceSecret.findUnique({
    where: {
      workspaceId_name: {
        workspaceId: input.workspaceId,
        name: input.name,
      },
    },
    select: { id: true },
  });
  if (existing)
    throw new ORPCError("CONFLICT", {
      message: `A secret named "${input.name}" already exists in this workspace.`,
    });

  const { encryptedData, iv } = await encryptSecretValue(input.value);
  const created = await prisma.workspaceSecret.create({
    data: {
      workspaceId: input.workspaceId,
      name: input.name,
      data: encryptedData,
      iv,
    },
    select: { id: true, name: true },
  });
  return { secret: created };
};
