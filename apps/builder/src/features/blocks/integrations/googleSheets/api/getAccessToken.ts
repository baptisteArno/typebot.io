import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";
import { authenticatedProcedure } from "@/helpers/server/trpc";
import { TRPCError } from "@trpc/server";
import type { GoogleSheetsCredentials } from "@typebot.io/blocks-integrations/googleSheets/schema";
import { env } from "@typebot.io/env";
import { decrypt } from "@typebot.io/lib/api/encryption/decrypt";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { OAuth2Client } from "google-auth-library";

export const getAccessToken = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
    }),
  )
  .query(async ({ input: { workspaceId, credentialsId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        members: true,
        credentials: {
          where: {
            id: credentialsId,
          },
          select: {
            data: true,
            iv: true,
          },
        },
      },
    });
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      });

    const credentials = workspace.credentials[0];
    if (!credentials)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Credentials not found",
      });
    const decryptedCredentials = (await decrypt(
      credentials.data,
      credentials.iv,
    )) as GoogleSheetsCredentials["data"];

    const client = new OAuth2Client({
      clientId: env.GOOGLE_SHEETS_CLIENT_ID,
      clientSecret: env.GOOGLE_SHEETS_CLIENT_SECRET,
      redirectUri: `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
    });

    client.setCredentials(decryptedCredentials);

    return { accessToken: (await client.getAccessToken()).token };
  });
