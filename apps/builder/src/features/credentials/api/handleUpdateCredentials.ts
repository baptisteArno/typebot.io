import { ORPCError } from "@orpc/server";
import { encrypt } from "@typebot.io/credentials/encrypt";
import {
  googleSheetsCredentialsSchema,
  smtpCredentialsSchema,
  stripeCredentialsSchema,
  whatsAppCredentialsSchema,
} from "@typebot.io/credentials/schemas";
import { forgedCredentialsSchemas } from "@typebot.io/forge-repository/credentials";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

const inputShape = {
  name: true,
  data: true,
  type: true,
} as const;

const credentialsUpdateSchema = z.discriminatedUnion("type", [
  stripeCredentialsSchema.pick(inputShape),
  smtpCredentialsSchema.pick(inputShape),
  googleSheetsCredentialsSchema.pick(inputShape),
  whatsAppCredentialsSchema.pick(inputShape),
  ...Object.values(forgedCredentialsSchemas).map((schema) =>
    schema.pick(inputShape),
  ),
]);

export const updateCredentialsInputSchema = z.discriminatedUnion("scope", [
  z.object({
    scope: z.literal("workspace"),
    credentialsId: z.string(),
    credentials: credentialsUpdateSchema,
    workspaceId: z.string(),
  }),
  z.object({
    scope: z.literal("user"),
    credentialsId: z.string(),
    credentials: credentialsUpdateSchema,
  }),
]);

export const handleUpdateCredentials = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof updateCredentialsInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  if (input.scope === "user") {
    const { encryptedData, iv } = await encrypt(input.credentials.data);
    const updatedCredentials = await prisma.userCredentials.update({
      where: {
        id: input.credentialsId,
        userId: user.id,
      },
      data: {
        name: input.credentials.name,
        data: encryptedData,
        iv,
      },
    });
    return { credentialsId: updatedCredentials.id };
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

  const { encryptedData, iv } = await encrypt(input.credentials.data);
  const updatedCredentials = await prisma.credentials.update({
    where: {
      id: input.credentialsId,
      workspaceId: input.workspaceId,
    },
    data: {
      name: input.credentials.name,
      data: encryptedData,
      iv,
    },
  });
  return { credentialsId: updatedCredentials.id };
};
