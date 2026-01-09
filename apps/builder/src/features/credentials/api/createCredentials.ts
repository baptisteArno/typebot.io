import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { encrypt } from "@typebot.io/credentials/encrypt";
import type { Credentials } from "@typebot.io/credentials/schemas";
import {
  googleSheetsCredentialsSchema,
  smtpCredentialsSchema,
  stripeCredentialsSchema,
  whatsAppCredentialsSchema,
} from "@typebot.io/credentials/schemas";
import { forgedCredentialsSchemas } from "@typebot.io/forge-repository/credentials";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { z } from "@typebot.io/zod";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";

const inputShape = {
  data: true,
  type: true,
  name: true,
} as const;

const credentialsCreateSchema = z
  .discriminatedUnion("type", [
    stripeCredentialsSchema.pick(inputShape),
    smtpCredentialsSchema.pick(inputShape),
    googleSheetsCredentialsSchema.pick(inputShape),
    whatsAppCredentialsSchema.pick(inputShape),
    ...Object.values(forgedCredentialsSchemas).map((schema) =>
      schema.pick(inputShape),
    ),
  ])
  .and(z.object({ id: z.string().cuid2().optional() }));

export const createCredentials = authenticatedProcedure
  .input(
    z.discriminatedUnion("scope", [
      z.object({
        scope: z.literal("workspace"),
        credentials: credentialsCreateSchema,
        workspaceId: z.string(),
      }),
      z.object({
        scope: z.literal("user"),
        credentials: credentialsCreateSchema,
      }),
    ]),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .handler(async ({ input, context: { user } }) => {
    if (input.scope === "user") {
      const { encryptedData, iv } = await encrypt(input.credentials.data);
      const createdCredentials = await prisma.userCredentials.create({
        data: {
          ...input.credentials,
          userId: user.id,
          data: encryptedData,
          iv,
        },
      });
      return { credentialsId: createdCredentials.id };
    }
    if (
      await isNotAvailable(
        input.credentials.name,
        input.credentials.type as Credentials["type"],
      )
    )
      throw new ORPCError("CONFLICT", {
        message: "Credentials already exist.",
      });
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
      },
      select: { id: true, members: { select: { userId: true, role: true } } },
    });
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

    const { encryptedData, iv } = await encrypt(input.credentials.data);
    const createdCredentials = await prisma.credentials.create({
      data: {
        ...input.credentials,
        workspaceId: input.workspaceId,
        data: encryptedData,
        iv,
      },
      select: {
        id: true,
      },
    });
    if (input.credentials.type === "whatsApp")
      await trackEvents([
        {
          workspaceId: workspace.id,
          userId: user.id,
          name: "WhatsApp credentials created",
        },
      ]);
    return { credentialsId: createdCredentials.id };
  });

const isNotAvailable = async (name: string, type: Credentials["type"]) => {
  if (type !== "whatsApp") return;
  const existingCredentials = await prisma.credentials.findFirst({
    where: {
      type,
      name,
    },
  });
  return isDefined(existingCredentials);
};
