import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import type { Prisma } from "@typebot.io/prisma/types";
import { type Credentials, OAuth2Client } from "google-auth-library";
import { decrypt } from "./api/encryption/decrypt";
import { encrypt } from "./api/encryption/encrypt";
import { isDefined } from "./utils";

export const getAuthenticatedGoogleClient = async (
  credentialsId: string,
): Promise<OAuth2Client | undefined> => {
  const credentials = (await prisma.credentials.findFirst({
    where: { id: credentialsId },
  })) as Prisma.Credentials | undefined;
  if (!credentials) return;
  const data = await decrypt(credentials.data, credentials.iv);

  const oauth2Client = new OAuth2Client(
    env.GOOGLE_SHEETS_CLIENT_ID,
    env.GOOGLE_SHEETS_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
  );
  oauth2Client.setCredentials(data);
  oauth2Client.on("tokens", updateTokens(credentialsId, data));
  return oauth2Client;
};

const updateTokens =
  (credentialsId: string, existingCredentials: any) =>
  async (credentials: Credentials) => {
    if (
      isDefined(existingCredentials.id_token) &&
      credentials.id_token !== existingCredentials.id_token
    )
      return;
    const newCredentials = {
      ...existingCredentials,
      expiry_date: credentials.expiry_date,
      access_token: credentials.access_token,
    };
    const { encryptedData, iv } = await encrypt(newCredentials);
    await prisma.credentials.updateMany({
      where: { id: credentialsId },
      data: { data: encryptedData, iv },
    });
  };
