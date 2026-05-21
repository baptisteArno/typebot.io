import { ORPCError } from "@orpc/server";
import { encrypt } from "@typebot.io/credentials/encrypt";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import type { User } from "@typebot.io/user/schemas";
import { OAuth2Client } from "google-auth-library";
import { cookies } from "next/headers";
import { z } from "zod";
import { getAuthorizedGoogleSheetsOAuthResources } from "./getAuthorizedGoogleSheetsOAuthResources";
import {
  clearGoogleSheetsOAuthStateCookie,
  googleSheetsOAuthStateCookieName,
  parseGoogleSheetsOAuthState,
} from "./googleSheetsOAuthState";
import { googleSheetsScopes } from "./handleGetConsentUrl";

export const handleCallbackInputSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const handleHandleCallback = async ({
  input: { code, state },
  context: { user },
}: {
  input: z.infer<typeof handleCallbackInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  const oauthState = parseGoogleSheetsOAuthState(state);
  const stateCookie = (await cookies()).get(googleSheetsOAuthStateCookieName);

  if (oauthState.userId !== user.id || stateCookie?.value !== oauthState.nonce)
    throw new ORPCError("BAD_REQUEST", {
      message: "Invalid OAuth state",
    });

  const { typebot } = await getAuthorizedGoogleSheetsOAuthResources({
    workspaceId: oauthState.workspaceId,
    typebotId: oauthState.typebotId,
    user,
  });

  const oauth2Client = new OAuth2Client(
    env.GOOGLE_SHEETS_CLIENT_ID,
    env.GOOGLE_SHEETS_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
  );

  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens?.access_token) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", {
      message: "Error getting oAuth tokens",
    });
  }

  oauth2Client.setCredentials(tokens);
  const { email, scopes } = await oauth2Client.getTokenInfo(
    tokens.access_token,
  );

  if (!email)
    throw new ORPCError("BAD_REQUEST", {
      message: "Couldn't get email from getTokenInfo",
    });

  if (googleSheetsScopes.some((scope) => !scopes.includes(scope)))
    throw new ORPCError("BAD_REQUEST", {
      message: "User didn't accepted required scopes",
    });

  const { encryptedData, iv } = await encrypt(tokens);
  const credentials = {
    name: email,
    type: "google sheets",
    workspaceId: oauthState.workspaceId,
    data: encryptedData,
    iv,
  } satisfies Prisma.Prisma.CredentialsUncheckedCreateInput;

  await prisma.$transaction(async (tx) => {
    const createdCredentials = await tx.credentials.create({
      data: credentials,
      select: {
        id: true,
      },
    });

    if (!typebot || !oauthState.typebotId || !oauthState.blockId)
      return createdCredentials;

    const groups = parseGroups(typebot.groups, {
      typebotVersion: typebot.version,
    }).map((group) => {
      const block = group.blocks.find(
        (block) => block.id === oauthState.blockId,
      );
      if (!block) return group;
      return {
        ...group,
        blocks: group.blocks.map((block) => {
          if (block.id !== oauthState.blockId) return block;
          return {
            ...block,
            options:
              "options" in block
                ? { ...block.options, credentialsId: createdCredentials.id }
                : {
                    credentialsId: createdCredentials.id,
                  },
          };
        }),
      };
    });

    await tx.typebot.updateMany({
      where: {
        id: oauthState.typebotId,
        workspaceId: oauthState.workspaceId,
      },
      data: {
        groups,
      },
    });

    return createdCredentials;
  });

  if (!oauthState.typebotId || !oauthState.blockId) {
    return {
      headers: {
        location: oauthState.redirectPath,
        "set-cookie": clearGoogleSheetsOAuthStateCookie(),
      },
    };
  }

  return {
    headers: {
      location: `${oauthState.redirectPath}?${new URLSearchParams({
        blockId: oauthState.blockId,
      })}`,
      "set-cookie": clearGoogleSheetsOAuthStateCookie(),
    },
  };
};
