import { env } from "@typebot.io/env";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

export const googleSheetsScopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

export const getConsentUrlInputSchema = z.object({
  redirectUrl: z.string().optional(),
  workspaceId: z.string().optional(),
  typebotId: z.string().optional(),
  blockId: z.string().optional(),
});

export const handleGetConsentUrl = async ({
  input,
}: {
  input: z.infer<typeof getConsentUrlInputSchema>;
}) => {
  const oauth2Client = new OAuth2Client(
    env.GOOGLE_SHEETS_CLIENT_ID,
    env.GOOGLE_SHEETS_CLIENT_SECRET,
    `${env.NEXTAUTH_URL}/api/credentials/google-sheets/callback`,
  );
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: googleSheetsScopes,
    prompt: "consent",
    state: Buffer.from(JSON.stringify(input)).toString("base64"),
  });
  return {
    headers: {
      location: url,
    },
  };
};
