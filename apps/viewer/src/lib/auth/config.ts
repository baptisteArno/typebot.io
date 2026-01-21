import { env } from "@typebot.io/env";
import prisma from "@typebot.io/prisma";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET || env.ENCRYPTION_SECRET,

  // Cross-subdomain SSO configuration (shared with builder)
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
});

export type Auth = typeof auth;
