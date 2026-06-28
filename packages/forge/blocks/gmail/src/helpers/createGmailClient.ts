import { auth, gmail } from "@googleapis/gmail";

export const createGmailClient = (accessToken: string) => {
  const oauthClient = new auth.OAuth2({
    credentials: {
      access_token: accessToken,
    },
  });

  return gmail({
    version: "v1",
    auth: oauthClient,
  });
};
