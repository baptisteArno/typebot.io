import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { encryptSecretValue } from "@typebot.io/workspace-secrets/encryptSecretValue";
import { workspaceSecretValueSchema } from "@typebot.io/workspace-secrets/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const updateWorkspaceSecretInputSchema = z.object({
  workspaceId: z.string(),
  secretId: z.string(),
  value: workspaceSecretValueSchema,
});

export const handleUpdateWorkspaceSecret = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof updateWorkspaceSecretInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: input.workspaceId },
    select: { id: true, members: { select: { userId: true, role: true } } },
  });
  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const { encryptedData, iv } = await encryptSecretValue(input.value);
  const updated = await prisma.workspaceSecret.update({
    where: { id: input.secretId, workspaceId: input.workspaceId },
    data: { data: encryptedData, iv },
    select: { id: true, name: true },
  });
  return { secret: updated };
};
