import { env } from "@typebot.io/env";
import { getAtPath } from "@typebot.io/lib/utils";
import { userSchema } from "@typebot.io/user/schemas";
import FacebookProvider from "next-auth/providers/facebook";
import GitHubProvider from "next-auth/providers/github";
import GitlabProvider from "next-auth/providers/gitlab";
import GoogleProvider from "next-auth/providers/google";
import type { Provider } from "next-auth/providers/index";
import KeycloakProvider from "next-auth/providers/keycloak";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import Nodemailer from "next-auth/providers/nodemailer";
import { sendVerificationRequest } from "../helpers/sendVerificationRequest";

export const providers: Provider[] = [];

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
  providers.push(
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );

if (env.NEXT_PUBLIC_SMTP_FROM && !env.SMTP_AUTH_DISABLED)
  providers.push(
    Nodemailer({
      server: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        ignoreTLS: env.SMTP_IGNORE_TLS,
        auth:
          env.SMTP_USERNAME || env.SMTP_PASSWORD
            ? {
                user: env.SMTP_USERNAME,
                pass: env.SMTP_PASSWORD,
              }
            : undefined,
      },
      maxAge: 5 * 60,
      from: env.NEXT_PUBLIC_SMTP_FROM,
      generateVerificationToken: () =>
        Math.floor(100000 + Math.random() * 900000).toString(),
      sendVerificationRequest,
    }),
  );

if (env.GOOGLE_AUTH_CLIENT_ID && env.GOOGLE_AUTH_CLIENT_SECRET)
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );

if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)
  providers.push(
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );

if (env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) {
  const BASE_URL = env.GITLAB_BASE_URL;
  providers.push(
    GitlabProvider({
      clientId: env.GITLAB_CLIENT_ID,
      clientSecret: env.GITLAB_CLIENT_SECRET,
      authorization: `${BASE_URL}/oauth/authorize?scope=read_api`,
      token: `${BASE_URL}/oauth/token`,
      userinfo: `${BASE_URL}/api/v4/user`,
      name: env.GITLAB_NAME,
    }),
  );
}

if (
  env.AZURE_AD_CLIENT_ID &&
  env.AZURE_AD_CLIENT_SECRET &&
  env.AZURE_AD_TENANT_ID
) {
  providers.push(
    MicrosoftEntraID({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      issuer: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID || "common"}/v2.0`,
    }),
  );
}

if (
  env.KEYCLOAK_CLIENT_ID &&
  env.KEYCLOAK_BASE_URL &&
  env.KEYCLOAK_CLIENT_SECRET &&
  env.KEYCLOAK_REALM
) {
  providers.push(
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: `${env.KEYCLOAK_BASE_URL}/${env.KEYCLOAK_REALM}`,
    }),
  );
}

if (env.CUSTOM_OAUTH_ISSUER) {
  providers.push({
    id: "custom-oauth",
    name: env.CUSTOM_OAUTH_NAME,
    type: "oidc",
    authorization: {
      params: {
        scope: env.CUSTOM_OAUTH_SCOPE,
      },
    },
    clientId: env.CUSTOM_OAUTH_CLIENT_ID,
    clientSecret: env.CUSTOM_OAUTH_CLIENT_SECRET,
    wellKnown: env.CUSTOM_OAUTH_WELL_KNOWN_URL,
    issuer: env.CUSTOM_OAUTH_ISSUER,
    profile(profile) {
      const user = {
        id: getAtPath(profile, env.CUSTOM_OAUTH_USER_ID_PATH),
        name: getAtPath(profile, env.CUSTOM_OAUTH_USER_NAME_PATH),
        email: getAtPath(profile, env.CUSTOM_OAUTH_USER_EMAIL_PATH),
        image: getAtPath(profile, env.CUSTOM_OAUTH_USER_IMAGE_PATH),
      };
      return userSchema
        .pick({ id: true, email: true, name: true, image: true })
        .parse(user);
    },
  });
}
