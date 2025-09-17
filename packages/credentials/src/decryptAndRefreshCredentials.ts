import { forgedBlocks } from "@typebot.io/forge-repository/definitions";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import prisma from "@typebot.io/prisma";
import ky from "ky";
import { decrypt } from "./decrypt";
import { encrypt } from "./encrypt";
import type { Credentials } from "./schemas";

export const decryptAndRefreshCredentialsData = async (
  credentials: Pick<Credentials, "id" | "data" | "iv" | "type">,
  defaultClientEnvKeys:
    | {
        id: string;
        secret: string;
      }
    | undefined,
) => {
  if (!credentials) return;
  const decryptedData = await decrypt(credentials.data, credentials.iv);
  const blockDef = forgedBlocks[credentials.type as keyof typeof forgedBlocks];
  if (blockDef.auth?.type === "oauth") {
    const { customClient, refreshToken, expiryDate } = decryptedData as {
      customClient?: {
        id: string;
        secret: string;
      };
      refreshToken: string;
      expiryDate: number;
    };
    const client =
      customClient ||
      (defaultClientEnvKeys
        ? {
            id: process.env[defaultClientEnvKeys.id],
            secret: process.env[defaultClientEnvKeys.secret],
          }
        : undefined);

    if (!client) throw new Error("No client found for oauth block");

    if (expiryDate && expiryDate > Date.now())
      return {
        ...decryptedData,
        client,
      };

    try {
      const tokens = await ky
        .post(blockDef.auth.tokenUrl, {
          json: {
            grant_type: "refresh_token",
            refresh_token: refreshToken,
            client_id: client.id,
            client_secret: client.secret,
          },
        })
        .json();

      if (
        !tokens ||
        typeof tokens !== "object" ||
        !("access_token" in tokens) ||
        !("expires_in" in tokens) ||
        typeof tokens.access_token !== "string" ||
        typeof tokens.expires_in !== "number"
      )
        throw new Error("Invalid tokens returned from the auth provider");

      const newTokens = {
        accessToken: tokens.access_token,
        refreshToken,
        expiryDate: Date.now() + (tokens.expires_in ?? 0) * 1000,
      };

      const { encryptedData, iv } = await encrypt({
        ...newTokens,
        client,
      });

      await prisma.credentials.update({
        where: { id: credentials.id },
        data: {
          data: encryptedData,
          iv,
        },
      });

      return {
        ...newTokens,
        client,
      };
    } catch (err) {
      const parsedError = await parseUnknownError({
        err,
        context: "token exchange",
      });
      console.error(parsedError);
      throw new Error(parsedError.description);
    }
  }
  return decryptedData;
};
