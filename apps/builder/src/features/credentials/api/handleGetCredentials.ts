import { ORPCError } from "@orpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

export const getCredentialsInputSchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("workspace"),
    workspaceId: z.string(),
    credentialsId: z.string(),
  }),
  z.object({
    scope: z.literal("user"),
    credentialsId: z.string(),
  }),
]);

export const handleGetCredentials = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getCredentialsInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  if (input.scope === "user") {
    const credentials = await prisma.userCredentials.findFirst({
      where: {
        id: input.credentialsId,
        userId: user.id,
      },
    });
    if (!credentials)
      throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });
    const credentialsData = await decrypt(credentials.data, credentials.iv);
    return {
      name: credentials.name,
      data: credentialsData,
    };
  }
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: input.workspaceId,
    },
    select: {
      id: true,
      members: true,
    },
  });
  if (!workspace || isWriteWorkspaceForbidden(workspace, user))
    throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

  const credentials = await prisma.credentials.findFirst({
    where: {
      id: input.credentialsId,
      workspaceId: workspace.id,
    },
    select: {
      data: true,
      iv: true,
      name: true,
    },
  });

  if (!credentials)
    throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });

  const credentialsData = await decrypt(credentials.data, credentials.iv);

  return {
    name: credentials.name,
    data: credentialsData,
  };
};
