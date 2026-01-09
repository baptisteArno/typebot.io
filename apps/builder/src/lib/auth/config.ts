import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { Plan } from "@typebot.io/prisma/enum";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import { admin } from "better-auth/plugins/admin";
import { genericOAuth } from "better-auth/plugins/generic-oauth";
import { magicLink } from "better-auth/plugins/magic-link";
import { getOAuthProviders } from "./providers";
import { sendVerificationEmail } from "./send-verification-email";

/**
 * Determines the default workspace plan for a new user.
 * Admin emails get UNLIMITED, otherwise uses DEFAULT_WORKSPACE_PLAN or FREE.
 */
function getDefaultWorkspacePlan(userEmail: string): Plan {
  if (env.ADMIN_EMAIL?.some((email) => email === userEmail)) {
    return Plan.UNLIMITED;
  }
  const defaultPlan = env.DEFAULT_WORKSPACE_PLAN as Plan;
  if (defaultPlan && Object.values(Plan).includes(defaultPlan)) {
    return defaultPlan;
  }
  return Plan.FREE;
}

/**
 * Validates if an email domain is allowed based on ALLOWED_EMAIL_DOMAINS env var.
 * When ALLOWED_EMAIL_DOMAINS is set, only emails from those domains can sign in.
 * When not set, all email domains are allowed.
 */
function isEmailDomainAllowed(email: string): boolean {
  const allowedDomains = env.ALLOWED_EMAIL_DOMAINS;

  // If no domains configured, allow all
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }

  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain) {
    return false;
  }

  return allowedDomains.includes(emailDomain);
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET || env.ENCRYPTION_SECRET,

  // Cross-subdomain SSO configuration
  advanced: {
    crossSubDomainCookies: env.AUTH_COOKIE_DOMAIN
      ? {
          enabled: true,
          domain: env.AUTH_COOKIE_DOMAIN,
        }
      : { enabled: false },
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
    enabled: false, // ALWAYS disabled - passwordless only (OAuth + magic link)
  },

  socialProviders: getOAuthProviders(),

  plugins: [
    // Admin plugin for user management
    admin({
      defaultRole: "user",
    }),

    // Magic link plugin for email-based signin (when EMAIL_LOGIN_ENABLED=true)
    ...(env.EMAIL_LOGIN_ENABLED
      ? [
          magicLink({
            sendMagicLink: async ({ email, url }) => {
              await sendVerificationEmail({ email, url });
            },
          }),
        ]
      : []),

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
      trustedProviders: [
        "github",
        "google",
        "facebook",
        "gitlab",
        "azure-ad",
        "keycloak",
        "custom-oauth",
      ],
    },
  },

  // Database hooks for domain filtering and workspace creation
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!user.email) {
            throw new APIError("BAD_REQUEST", {
              message: "Email is required",
            });
          }

          if (!isEmailDomainAllowed(user.email)) {
            const allowedDomains = env.ALLOWED_EMAIL_DOMAINS?.join(", ");
            throw new APIError("FORBIDDEN", {
              message: `Sign-in is restricted to authorized email domains: ${allowedDomains}`,
            });
          }

          return { data: user };
        },
        after: async (user) => {
          // Create initial workspace for new users
          const plan = getDefaultWorkspacePlan(user.email);
          const workspaceName = user.name
            ? `${user.name}'s workspace`
            : "My workspace";

          await prisma.workspace.create({
            data: {
              name: workspaceName,
              plan,
              members: {
                create: [{ role: "ADMIN", userId: user.id }],
              },
            },
          });
        },
      },
    },
  },
});

export type Auth = typeof auth;
