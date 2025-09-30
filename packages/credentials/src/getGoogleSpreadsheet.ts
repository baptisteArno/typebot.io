import { env } from "@typebot.io/env";
import { parseUnknownError } from "@typebot.io/lib/parseUnknownError";
import type { LogInSession } from "@typebot.io/logs/schemas";
import prisma from "@typebot.io/prisma";
import { GoogleSpreadsheet } from "google-spreadsheet";
import ky from "ky";
import { decrypt } from "./decrypt";
import { encrypt } from "./encrypt";
import { getCredentials } from "./getCredentials";
import type { GoogleSheetsCredentials } from "./schemas";

const TOKEN_URL = "https://oauth2.googleapis.com/token" as const;

type Params = {
  spreadsheetId: string;
  credentialsId: string;
  workspaceId: string | undefined;
};

export const getGoogleSpreadsheet = async ({
  spreadsheetId,
  credentialsId,
  workspaceId,
}: Params): Promise<
  | { type: "success"; spreadsheet: GoogleSpreadsheet }
  | { type: "error"; log: LogInSession }
> => {
  const credentials = await getCredentials(credentialsId, workspaceId);
  if (!credentials)
    return {
      type: "error",
      log: {
        description: "Credentials not found",
        context: "While getting Google Spreadsheet",
      },
    };
  const decryptedData = await decrypt(credentials.data, credentials.iv);
  const { refresh_token, expiry_date, access_token } =
    decryptedData as GoogleSheetsCredentials["data"];

  if (!access_token)
    return {
      type: "error",
      log: {
        description: "No access token found in Sheets credentials",
        context: "While getting Google Spreadsheet",
      },
    };

  const client = {
    id: env.GOOGLE_SHEETS_CLIENT_ID,
    secret: env.GOOGLE_SHEETS_CLIENT_SECRET,
  };

  if (expiry_date && expiry_date > Date.now())
    return {
      type: "success",
      spreadsheet: new GoogleSpreadsheet(spreadsheetId, {
        token: access_token,
      }),
    };

  try {
    if (!refresh_token)
      return {
        type: "error",
        log: {
          description: "No refresh token found in Sheets credentials",
          context: "While getting Google Spreadsheet",
        },
      };

    const tokens = await ky
      .post(TOKEN_URL, {
        json: {
          grant_type: "refresh_token",
          refresh_token: refresh_token,
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
      ...decryptedData,
      access_token: tokens.access_token,
      expiry_date: Date.now() + (tokens.expires_in ?? 3600) * 1000, // Default 1 hour
    } satisfies GoogleSheetsCredentials["data"];

    const { encryptedData, iv } = await encrypt(newTokens);

    await prisma.credentials.update({
      where: { id: credentialsId },
      data: {
        data: encryptedData,
        iv,
      },
    });

    return {
      type: "success",
      spreadsheet: new GoogleSpreadsheet(spreadsheetId, {
        token: newTokens.access_token,
      }),
    };
  } catch (err) {
    const parsedError = await parseUnknownError({
      err,
      context: "token exchange",
    });
    console.error(parsedError);
    return { type: "error", log: parsedError };
  }
};
