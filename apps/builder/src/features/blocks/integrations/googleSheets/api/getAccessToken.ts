import { ORPCError } from "@orpc/server";
import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { GoogleSheetsCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { z } from "@typebot.io/zod";
import { OAuth2Client } from "google-auth-library";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const getAccessToken = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      credentialsId: z.string(),
    }),
  )
  .handler(
    async ({ input: { workspaceId, credentialsId }, context: { user } }) => {
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
        throw new ORPCError("NOT_FOUND", { message: "Workspace not found" });

      const credentials = workspace.credentials[0];
      if (!credentials)
        throw new ORPCError("NOT_FOUND", { message: "Credentials not found" });
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
    },
  );
