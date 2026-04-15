import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const deleteWorkspaceSecretInputSchema = z.object({
  workspaceId: z.string(),
  secretId: z.string(),
});

export const handleDeleteWorkspaceSecret = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof deleteWorkspaceSecretInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const workspace = await prisma.workspace.findFirst({
    where: { id: input.workspaceId },
    select: { id: true, members: { select: { userId: true, role: true } } },
  });
  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  await prisma.workspaceSecret.delete({
    where: { id: input.secretId, workspaceId: input.workspaceId },
  });
  return { secretId: input.secretId };
};
