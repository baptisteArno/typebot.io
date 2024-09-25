import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { stripeCredentialsSchema } from "@typebot.io/blocks-inputs/payment/schema";
import { googleSheetsCredentialsSchema } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { smtpCredentialsSchema } from "@typebot.io/blocks-integrations/sendEmail/schema";
import type { Credentials } from "@typebot.io/credentials/schemas";
import { forgedCredentialsSchemas } from "@typebot.io/forge-repository/credentials";
import { encrypt } from "@typebot.io/lib/api/encryption/encrypt";
import { isDefined } from "@typebot.io/lib/utils";
import prisma from "@typebot.io/prisma";
import { trackEvents } from "@typebot.io/telemetry/trackEvents";
import { whatsAppCredentialsSchema } from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

const inputShape = {
  data: true,
  type: true,
  workspaceId: true,
  name: true,
} as const;

export const createCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: "POST",
      path: "/v1/credentials",
      protect: true,
      summary: "Create credentials",
      tags: ["Credentials"],
    },
  })
  .input(
    z.object({
      credentials: z
        .discriminatedUnion("type", [
          stripeCredentialsSchema.pick(inputShape),
          smtpCredentialsSchema.pick(inputShape),
          googleSheetsCredentialsSchema.pick(inputShape),
          whatsAppCredentialsSchema.pick(inputShape),
          ...Object.values(forgedCredentialsSchemas).map((i) =>
            i.pick(inputShape),
          ),
        ])
        .and(z.object({ id: z.string().cuid2().optional() })),
    }),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .mutation(async ({ input: { credentials }, ctx: { user } }) => {
    if (
      await isNotAvailable(
        credentials.name,
        credentials.type as Credentials["type"],
      )
    )
      throw new TRPCError({
        code: "CONFLICT",
        message: "Credentials already exist.",
      });
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: credentials.workspaceId,
      },
      select: { id: true, members: { select: { userId: true, role: true } } },
    });
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const { encryptedData, iv } = await encrypt(credentials.data);
    const createdCredentials = await prisma.credentials.create({
      data: {
        ...credentials,
        data: encryptedData,
        iv,
      },
      select: {
        id: true,
      },
    });
    if (credentials.type === "whatsApp")
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
