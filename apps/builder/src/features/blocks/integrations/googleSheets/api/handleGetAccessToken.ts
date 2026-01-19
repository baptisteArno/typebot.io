import { ORPCError } from "@orpc/server";
import { decrypt } from "@typebot.io/credentials/decrypt";
import type { GoogleSheetsCredentials } from "@typebot.io/credentials/schemas";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { User } from "@typebot.io/user/schemas";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";
import { isReadWorkspaceFobidden } from "@/features/workspace/helpers/isReadWorkspaceFobidden";

export const getAccessTokenInputSchema = z.object({
  workspaceId: z.string(),
  credentialsId: z.string(),
});

export const handleGetAccessToken = async ({
  input: { workspaceId, credentialsId },
  context: { user },
}: {
  input: z.infer<typeof getAccessTokenInputSchema>;
  context: { user: Pick<User, "id" | "email"> };
}) => {
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
};
