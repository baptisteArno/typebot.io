import { ORPCError } from "@orpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import { createToastORPCError } from "@typebot.io/lib/createToastORPCError";
import { ky } from "@typebot.io/lib/ky";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";

export const getSystemTokenInfoInputSchema = z.object({
  token: z.string().optional(),
  credentialsId: z.string().optional(),
});

export const handleGetSystemTokenInfo = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getSystemTokenInfoInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  if (!input.token && !input.credentialsId)
    throw new ORPCError("BAD_REQUEST", {
      message: "Either token or credentialsId must be provided",
    });
  const credentials = await getCredentials(user.id, input);
  if (!credentials)
    throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });

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
    throw await createToastORPCError(err);
  }
};

const getCredentials = async (
  userId: string,
  input: z.infer<typeof getSystemTokenInfoInputSchema>,
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
    throw new ORPCError("BAD_REQUEST", {
      message: "This endpoint only supports Meta credentials",
    });
  }

  return {
    systemUserAccessToken: decryptedData.systemUserAccessToken,
  };
};
