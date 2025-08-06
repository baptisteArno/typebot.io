import { gmail } from "@googleapis/gmail";
import { OAuth2Client } from "google-auth-library";

export const createGmailClient = (accessToken: string) => {
  const oauthClient = new OAuth2Client({
    credentials: {
      access_token: accessToken,
    },
  });

  return gmail({
    version: "v1",
    auth: oauthClient,
  });
};
