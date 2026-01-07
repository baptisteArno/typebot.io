import { env } from "@typebot.io/env";
import type { BetterAuthOptions } from "better-auth";

type SocialProviders = NonNullable<BetterAuthOptions["socialProviders"]>;

export function getOAuthProviders(): SocialProviders {
  const providers: SocialProviders = {};

  // GitHub OAuth
  if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    };
  }

  // Google OAuth
  if (env.GOOGLE_AUTH_CLIENT_ID && env.GOOGLE_AUTH_CLIENT_SECRET) {
    providers.google = {
      clientId: env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: env.GOOGLE_AUTH_CLIENT_SECRET,
    };
  }

  // Facebook OAuth
  if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET) {
    providers.facebook = {
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    };
  }

  // GitLab OAuth
  if (env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) {
    providers.gitlab = {
      clientId: env.GITLAB_CLIENT_ID,
      clientSecret: env.GITLAB_CLIENT_SECRET,
      issuer: env.GITLAB_BASE_URL || "https://gitlab.com",
    };
  }

  // Microsoft Azure AD / Entra ID
  if (
    env.AZURE_AD_CLIENT_ID &&
    env.AZURE_AD_CLIENT_SECRET &&
    env.AZURE_AD_TENANT_ID
  ) {
    providers.microsoft = {
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
    };
  }

  return providers;
}
