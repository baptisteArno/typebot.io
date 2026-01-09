import { env } from "@typebot.io/env";

export type AvailableProviders = {
  github: boolean;
  google: boolean;
  facebook: boolean;
  gitlab: boolean;
  microsoft: boolean;
  keycloak: boolean;
  customOAuth: boolean;
  customOAuthName?: string;
  email: boolean;
};

/**
 * Server-side function to compute available auth providers
 * based on which OAuth credentials are configured.
 * This avoids the need for separate NEXT_PUBLIC_*_ENABLED flags.
 */
export function getAvailableProviders(): AvailableProviders {
  return {
    github: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    google: !!(env.GOOGLE_AUTH_CLIENT_ID && env.GOOGLE_AUTH_CLIENT_SECRET),
    facebook: !!(env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET),
    gitlab: !!(env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET),
    microsoft: !!(
      env.AZURE_AD_CLIENT_ID &&
      env.AZURE_AD_CLIENT_SECRET &&
      env.AZURE_AD_TENANT_ID
    ),
    keycloak: !!(
      env.KEYCLOAK_CLIENT_ID &&
      env.KEYCLOAK_CLIENT_SECRET &&
      env.KEYCLOAK_REALM &&
      env.KEYCLOAK_BASE_URL
    ),
    customOAuth: !!(
      env.CUSTOM_OAUTH_CLIENT_ID &&
      env.CUSTOM_OAUTH_CLIENT_SECRET &&
      env.CUSTOM_OAUTH_ISSUER
    ),
    customOAuthName: env.CUSTOM_OAUTH_NAME,
    // Email/magic link controlled by EMAIL_LOGIN_ENABLED env var
    email: env.EMAIL_LOGIN_ENABLED,
  };
}
