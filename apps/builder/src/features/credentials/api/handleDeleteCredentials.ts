import { ORPCError } from "@orpc/server";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const deleteCredentialsInputSchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("workspace"),
    credentialsId: z.string(),
    workspaceId: z.string(),
  }),
  z.object({
    scope: z.literal("user"),
    credentialsId: z.string(),
  }),
]);

export const handleDeleteCredentials = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof deleteCredentialsInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  if (input.scope === "user") {
    await prisma.userCredentials.delete({
      where: {
        id: input.credentialsId,
        userId: user.id,
      },
    });
    return { credentialsId: input.credentialsId };
  }

  const workspace = await prisma.workspace.findFirst({
    where: {
      id: input.workspaceId,
    },
    select: { id: true, members: { select: { userId: true, role: true } } },
  });
  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  await prisma.credentials.delete({
    where: {
      id: input.credentialsId,
      workspaceId: input.workspaceId,
    },
  });
  return { credentialsId: input.credentialsId };
};
