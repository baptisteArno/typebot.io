import { env } from "@typebot.io/env";
import type { User } from "@typebot.io/user/schemas";
import { OAuth2Client } from "google-auth-library";
import type { z } from "zod";
import { getAuthorizedGoogleSheetsOAuthResources } from "./getAuthorizedGoogleSheetsOAuthResources";
import {
  createGoogleSheetsOAuthState,
  googleSheetsOAuthContextSchema,
} from "./googleSheetsOAuthState";

export const googleSheetsScopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

export const getConsentUrlInputSchema = googleSheetsOAuthContextSchema;

export const handleGetConsentUrl = async ({
  input,
  context: { user },
}: {
  input: z.infer<typeof getConsentUrlInputSchema>;
  context: { user: Pick<User, "id"> };
}) => {
  await getAuthorizedGoogleSheetsOAuthResources({
    workspaceId: input.workspaceId,
    typebotId: input.typebotId,
    user,
  });

  const oauth2Client = new OAuth2Client(
    env.GOOGLE_SHEETS_CLIENT_ID,
    env.GOOGLE_SHEETS_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
  );
  const { state, cookie } = createGoogleSheetsOAuthState({
    input,
    userId: user.id,
  });
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: googleSheetsScopes,
    prompt: "consent",
    state,
  });
  return {
    headers: {
      location: url,
      "set-cookie": cookie,
    },
  };
};
