import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins/magic-link";
import { emailOTP } from "better-auth/plugins/email-otp";
import { admin } from "better-auth/plugins/admin";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { sendVerificationEmail } from "./send-verification-email";
import { getOAuthProviders } from "./providers";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET || env.ENCRYPTION_SECRET,

  // Cross-subdomain SSO configuration
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".usefoundry.ai",
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },

  emailAndPassword: {
    enabled: false, // Using magic link instead
  },

  socialProviders: getOAuthProviders(),

  plugins: [
    // Magic link email authentication
    ...(env.NEXT_PUBLIC_SMTP_FROM && !env.SMTP_AUTH_DISABLED
      ? [
          magicLink({
            sendMagicLink: async ({ email, url }) => {
              await sendVerificationEmail({ email, url });
            },
            expiresIn: 60 * 5, // 5 minutes
          }),
          emailOTP({
            sendVerificationOTP: async ({ email, otp }) => {
              await sendVerificationEmail({ email, otp });
            },
            otpLength: 6,
            expiresIn: 60 * 5, // 5 minutes
          }),
        ]
      : []),

    // Admin plugin for user management
    admin({
      defaultRole: "user",
    }),

    // Generic OAuth for custom OIDC providers
    ...(env.CUSTOM_OAUTH_ISSUER
      ? [
          genericOAuth({
            config: [
              {
                providerId: "custom-oauth",
                clientId: env.CUSTOM_OAUTH_CLIENT_ID!,
                clientSecret: env.CUSTOM_OAUTH_CLIENT_SECRET!,
                discoveryUrl: env.CUSTOM_OAUTH_WELL_KNOWN_URL,
                scopes: env.CUSTOM_OAUTH_SCOPE?.split(" ") || [
                  "openid",
                  "profile",
                  "email",
                ],
                pkce: true,
              },
            ],
          }),
        ]
      : []),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
      },
      lastActivityAt: {
        type: "date",
        required: false,
      },
      company: {
        type: "string",
        required: false,
      },
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["github", "google", "facebook", "gitlab", "azure-ad", "keycloak", "custom-oauth"],
    },
  },
});

export type Auth = typeof auth;
