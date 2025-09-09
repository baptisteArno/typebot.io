import { TRPCError } from "@trpc/server";
import { encrypt } from "@typebot.io/credentials/encrypt";
import { env } from "@typebot.io/env";
import type { OAuthDefinition } from "@typebot.io/forge/types";
import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import ky from "ky";
import { isWriteWorkspaceForbidden } from "@/features/workspace/helpers/isWriteWorkspaceForbidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";

export const updateOAuthCredentials = authenticatedProcedure
  .input(
    z.object({
      name: z.string(),
      blockType: z.string(),
      workspaceId: z.string(),
      customClient: z
        .object({
          id: z.string(),
          secret: z.string(),
        })
        .optional(),
      credentialsId: z.string(),
      code: z.string(),
    }),
  )
  .output(
    z.object({
      credentialsId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
      },
      select: { id: true, members: { select: { userId: true, role: true } } },
    });
    if (!workspace || isWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const blockDef = forgedBlocks[input.blockType as keyof typeof forgedBlocks];
    if (!blockDef || blockDef.auth?.type !== "oauth")
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Block is not an OAuth block",
      });

    const client = getClient(input.customClient, blockDef.auth);

    if (!client)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No client ID or secret provided or default client not set",
      });

    const tokens = await exchangeCodeForTokens({
      tokenUrl: blockDef.auth.tokenUrl,
      client,
      code: input.code,
    });

    const { encryptedData, iv } = await encrypt({
      ...tokens,
      client: input.customClient,
    });
    const updatedCredentials = await prisma.credentials.update({
      where: {
        id: input.credentialsId,
      },
      data: {
        name: input.name,
        type: input.blockType,
        workspaceId: input.workspaceId,
        data: encryptedData,
        iv,
      },
      select: {
        id: true,
      },
    });

    return { credentialsId: updatedCredentials.id };
  });

const exchangeCodeForTokens = async ({
  tokenUrl,
  client,
  code,
}: {
  tokenUrl: string;
  client: { id: string; secret: string };
  code: string;
}) => {
  try {
    const tokens = await ky
      .post(tokenUrl, {
        json: {
          grant_type: "authorization_code",
          code: code,
          client_id: client.id,
          client_secret: client.secret,
          redirect_uri: `${env.NEXTAUTH_URL}/oauth/redirect`,
        },
      })
      .json();

    if (
      !tokens ||
      typeof tokens !== "object" ||
      !("access_token" in tokens) ||
      !("refresh_token" in tokens) ||
      !("expires_in" in tokens) ||
      typeof tokens.access_token !== "string" ||
      typeof tokens.refresh_token !== "string" ||
      typeof tokens.expires_in !== "number"
    )
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Invalid tokens returned from the auth provider",
      });

    if (!tokens.refresh_token) {
      return {
        error: {
          context: "token exchange",
          description: "No refresh_token returned",
        },
      };
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: Date.now() + (tokens.expires_in ?? 0) * 1000,
    };
  } catch (err) {
    const parsedError = await parseUnknownError({
      err,
      context: "token exchange",
    });
    console.error(parsedError);
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: parsedError.description,
    });
  }
};

const getClient = (
  customClient: { id: string; secret: string } | undefined,
  authDef: OAuthDefinition,
) => {
  if (customClient) return customClient;
  if (authDef.defaultClientEnvKeys) {
    const id = process.env[authDef.defaultClientEnvKeys.id];
    const secret = process.env[authDef.defaultClientEnvKeys.secret];
    if (id && secret) return { id, secret };
  }
  return undefined;
};
