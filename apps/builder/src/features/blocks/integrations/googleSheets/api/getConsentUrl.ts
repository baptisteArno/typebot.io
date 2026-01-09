import { authenticatedProcedure } from "@typebot.io/config/orpc/builder/middlewares";
import { env } from "@typebot.io/env";
import { z } from "@typebot.io/zod";
import { OAuth2Client } from "google-auth-library";

export const googleSheetsScopes = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

export const getConsentUrl = authenticatedProcedure
  .route({
    method: "GET",
    path: "/credentials/google-sheets/consent-url",
    successStatus: 301,
    outputStructure: "detailed",
  })
  .input(
    z.object({
      redirectUrl: z.string().optional(),
      workspaceId: z.string().optional(),
      typebotId: z.string().optional(),
      blockId: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
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
  });
