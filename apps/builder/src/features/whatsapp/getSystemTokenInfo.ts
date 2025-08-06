import { authenticatedProcedure } from "@/helpers/server/trpc";
import { ClientToastError } from "@/lib/ClientToastError";
import { TRPCError } from "@trpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import ky from "ky";

const inputSchema = z.object({
  token: z.string().optional(),
  credentialsId: z.string().optional(),
});

export const getSystemTokenInfo = authenticatedProcedure
  .input(inputSchema)
  .query(async ({ input, ctx: { user } }) => {
    if (!input.token && !input.credentialsId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Either token or credentialsId must be provided",
      });
    const credentials = await getCredentials(user.id, input);
    if (!credentials)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });

    try {
      const {
        data: { expires_at, scopes, app_id, application },
      } = await ky
        .get(
          `${env.WHATSAPP_CLOUD_API_URL}/v17.0/debug_token?input_token=${credentials.systemUserAccessToken}`,
          {
            headers: {
              Authorization: `Bearer ${credentials.systemUserAccessToken}`,
            },
          },
        )
        .json<{
          data: {
            app_id: string;
            application: string;
            expires_at: number;
            scopes: string[];
          };
        }>();

      return {
        appId: app_id,
        appName: application,
        expiresAt: expires_at,
        scopes,
      };
    } catch (err) {
      throw await ClientToastError.fromUnkownError(err);
    }
  });

const getCredentials = async (
  userId: string,
  input: z.infer<typeof inputSchema>,
): Promise<{ systemUserAccessToken: string } | undefined> => {
  if (input.token)
    return {
      systemUserAccessToken: input.token,
    };
  const credentials = await prisma.credentials.findUnique({
    where: {
      id: input.credentialsId,
      workspace: { members: { some: { userId } } },
    },
  });
  if (!credentials) return;
  const decryptedData = (await decrypt(
    credentials.data,
    credentials.iv,
  )) as WhatsAppCredentials["data"];

  if (decryptedData.provider !== "meta") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This endpoint only supports Meta credentials",
    });
  }

  return {
    systemUserAccessToken: decryptedData.systemUserAccessToken,
  };
};
