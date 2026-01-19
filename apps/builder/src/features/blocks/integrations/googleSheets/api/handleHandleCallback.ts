import { ORPCError } from "@orpc/server";
import { encrypt } from "@typebot.io/credentials/encrypt";
import { env } from "@typebot.io/env";
import { parseGroups } from "@typebot.io/groups/helpers/parseGroups";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { googleSheetsScopes } from "./handleGetConsentUrl";

export const handleCallbackInputSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export const handleHandleCallback = async ({
  input: { code, state },
}: {
  input: z.infer<typeof handleCallbackInputSchema>;
}) => {
  const { typebotId, redirectUrl, blockId, workspaceId } = JSON.parse(
    Buffer.from(state, "base64").toString(),
  ) as {
    redirectUrl: string;
    workspaceId: string;
    typebotId?: string;
    blockId?: string;
  };

  if (!workspaceId)
    throw new ORPCError("BAD_REQUEST", {
      message: "workspaceId is required",
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
    workspaceId,
    data: encryptedData,
    iv,
  } satisfies Prisma.Prisma.CredentialsUncheckedCreateInput;

  const { id: credentialsId } = await prisma.credentials.create({
    data: credentials,
  });

  if (!typebotId) {
    return {
      headers: {
        location: `${redirectUrl.split("?")[0]}`,
      },
    };
  }

  const typebot = await prisma.typebot.findFirst({
    where: {
      id: typebotId,
    },
    select: {
      version: true,
      groups: true,
    },
  });

  if (!typebot)
    throw new ORPCError("NOT_FOUND", { message: "Typebot not found" });

  const groups = parseGroups(typebot.groups, {
    typebotVersion: typebot.version,
  }).map((group) => {
    const block = group.blocks.find((block) => block.id === blockId);
    if (!block) return group;
    return {
      ...group,
      blocks: group.blocks.map((block) => {
        if (block.id !== blockId) return block;
        return {
          ...block,
          options:
            "options" in block
              ? { ...block.options, credentialsId }
              : {
                  credentialsId,
                },
        };
      }),
    };
  });

  await prisma.typebot.updateMany({
    where: {
      id: typebotId,
    },
    data: {
      groups,
    },
  });

  return {
    headers: {
      location: `${redirectUrl.split("?")[0]}?blockId=${blockId}`,
    },
  };
};
