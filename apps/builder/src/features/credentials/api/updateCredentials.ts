import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import { stripeCredentialsSchema } from "@typebot.io/blocks-inputs/payment/schema";
import { googleSheetsCredentialsSchema } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { smtpCredentialsSchema } from "@typebot.io/blocks-integrations/sendEmail/schema";
import { forgedCredentialsSchemas } from "@typebot.io/forge-repository/credentials";
import { encrypt } from "@typebot.io/lib/api/encryption/encrypt";
import prisma from "@typebot.io/prisma";
import { whatsAppCredentialsSchema } from "@typebot.io/whatsapp/schemas";
import { z } from "@typebot.io/zod";

const inputShape = {
  name: true,
  data: true,
  type: true,
  workspaceId: true,
} as const;

export const updateCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: "PATCH",
      path: "/v1/credentials/{credentialsId}",
      protect: true,
      summary: "Create credentials",
      tags: ["Credentials"],
    },
  })
  .input(
    z.object({
      credentialsId: z.string(),
      credentials: z.discriminatedUnion("type", [
        stripeCredentialsSchema.pick(inputShape),
        smtpCredentialsSchema.pick(inputShape),
        googleSheetsCredentialsSchema.pick(inputShape),
        whatsAppCredentialsSchema.pick(inputShape),
        ...Object.values(forgedCredentialsSchemas).map((i) =>
          i.pick(inputShape),
        ),
      ]),
    }),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .mutation(
    async ({ input: { credentialsId, credentials }, ctx: { user } }) => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: credentials.workspaceId,
        },
        select: {
          id: true,
          members: true,
        },
      });
      if (!workspace || isWriteWorkspaceForbidden(workspace, user))
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        });

      const { encryptedData, iv } = await encrypt(credentials.data);
      const createdCredentials = await prisma.credentials.update({
        where: {
          id: credentialsId,
        },
        data: {
          name: credentials.name,
          data: encryptedData,
          iv,
        },
      });
      return { credentialsId: createdCredentials.id };
    },
  );
