import { createAuth } from "@typebot.io/forge";

const gmailScopes = [
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
] as const;

export const auth = createAuth({
  type: "oauth",
  name: "Gmail account",
  authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
  tokenUrl: "https://oauth2.googleapis.com/token",
  scopes: gmailScopes,
  defaultClientEnvKeys: {
    id: "GMAIL_CLIENT_ID",
    secret: "GMAIL_CLIENT_SECRET",
  },
  extraAuthParams: {
    access_type: "offline",
    prompt: "consent",
  },
});
