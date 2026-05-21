import { ORPCError } from "@orpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { WhatsAppCredentials } from "@typebot.io/credentials/schemas";
import { createToastORPCError } from "@typebot.io/lib/createToastORPCError";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { z } from "zod";
import { getMetaSystemTokenInfo } from "./getMetaSystemTokenInfo";

export const getSystemTokenInfoInputSchema = z.object({
  token: z.string().optional(),
  credentialsId: z.string().optional(),
  appSecret: z.string().trim().optional(),
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
    } = await getMetaSystemTokenInfo({
      systemUserAccessToken: credentials.systemUserAccessToken,
      appSecret: input.appSecret,
    });

    return {
      appId: app_id,
      appName: application,
      expiresAt: expires_at,
      scopes,
    };
  } catch (err) {
    if (err instanceof ORPCError) throw err;

    if (input.appSecret)
      throw new ORPCError("BAD_REQUEST", {
        message:
          "Could not validate the app secret with this System User Token. Make sure the app secret belongs to the Meta app used to generate the token.",
      });

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
