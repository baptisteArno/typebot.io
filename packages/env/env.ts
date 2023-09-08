import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import { getRuntimeVariable } from './getRuntimeVariable'

declare const window: {
  __ENV?: any
}

const boolean = z.enum(['true', 'false']).transform((value) => value === 'true')

const baseEnv = {
  server: {
    NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
    DATABASE_URL: z
      .string()
      .url()
      .refine((url) => url.startsWith('postgres') || url.startsWith('mysql')),
    ENCRYPTION_SECRET: z.string().length(32),
    NEXTAUTH_URL: z.string().url(),
    DISABLE_SIGNUP: boolean.optional().default('false'),
    ADMIN_EMAIL: z.string().email().optional(),
    DEFAULT_WORKSPACE_PLAN: z
      .enum(['FREE', 'STARTER', 'PRO', 'LIFETIME', 'UNLIMITED'])
      .refine((str) =>
        ['FREE', 'STARTER', 'PRO', 'LIFETIME', 'UNLIMITED'].includes(str)
      )
      .default('FREE'),
    DEBUG: boolean.optional().default('false'),
  },
  client: {
    NEXT_PUBLIC_E2E_TEST: boolean.optional(),
    NEXT_PUBLIC_VIEWER_URL: z
      .string()
      .min(1)
      .transform((string) => string.split(',')),
    NEXT_PUBLIC_VIEWER_INTERNAL_URL: z.string().url().optional(),
    NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_E2E_TEST: getRuntimeVariable('NEXT_PUBLIC_E2E_TEST'),
    NEXT_PUBLIC_VIEWER_URL: getRuntimeVariable('NEXT_PUBLIC_VIEWER_URL'),
    NEXT_PUBLIC_VIEWER_INTERNAL_URL: getRuntimeVariable(
      'NEXT_PUBLIC_VIEWER_INTERNAL_URL'
    ),
    NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID: getRuntimeVariable(
      'NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID'
    ),
  },
}
const githubEnv = {
  server: {
    GITHUB_CLIENT_ID: z.string().min(1).optional(),
    GITHUB_CLIENT_SECRET: z.string().min(1).optional(),
  },
}

const facebookEnv = {
  server: {
    FACEBOOK_CLIENT_ID: z.string().min(1).optional(),
    FACEBOOK_CLIENT_SECRET: z.string().min(1).optional(),
  },
}

const smtpEnv = {
  server: {
    SMTP_USERNAME: z.string().min(1).optional(),
    SMTP_PASSWORD: z.string().min(1).optional(),
    SMTP_HOST: z.string().min(1).optional(),
    SMTP_PORT: z.coerce.number().optional().default(25),
    SMTP_AUTH_DISABLED: boolean.optional().default('false'),
    SMTP_SECURE: boolean.optional().default('false'),
  },
  client: {
    NEXT_PUBLIC_SMTP_FROM: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SMTP_FROM: getRuntimeVariable('NEXT_PUBLIC_SMTP_FROM'),
  },
}

const gitlabEnv = {
  server: {
    GITLAB_CLIENT_ID: z.string().min(1).optional(),
    GITLAB_CLIENT_SECRET: z.string().min(1).optional(),
    GITLAB_BASE_URL: z.string().url().optional().default('https://gitlab.com'),
    GITLAB_NAME: z.string().min(1).optional().default('GitLab'),
    GITLAB_REQUIRED_GROUPS: z
      .string()
      .transform((string) => (string ? string.split(',') : undefined))
      .optional(),
  },
}

const azureEnv = {
  server: {
    AZURE_AD_CLIENT_ID: z.string().min(1).optional(),
    AZURE_AD_CLIENT_SECRET: z.string().min(1).optional(),
    AZURE_AD_TENANT_ID: z.string().min(1).optional(),
  },
}

const customOAuthEnv = {
  server: {
    CUSTOM_OAUTH_NAME: z.string().min(1).optional().default('Custom OAuth'),
    CUSTOM_OAUTH_SCOPE: z
      .string()
      .min(1)
      .optional()
      .default('openid profile email'),
    CUSTOM_OAUTH_CLIENT_ID: z.string().min(1).optional(),
    CUSTOM_OAUTH_CLIENT_SECRET: z.string().min(1).optional(),
    CUSTOM_OAUTH_WELL_KNOWN_URL: z.string().url().optional(),
    CUSTOM_OAUTH_USER_ID_PATH: z.string().min(1).optional().default('id'),
    CUSTOM_OAUTH_USER_EMAIL_PATH: z.string().min(1).optional().default('email'),
    CUSTOM_OAUTH_USER_NAME_PATH: z.string().min(1).optional().default('name'),
    CUSTOM_OAUTH_USER_IMAGE_PATH: z.string().min(1).optional().default('image'),
  },
}

const googleEnv = {
  server: {
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_GOOGLE_API_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_GOOGLE_API_KEY: getRuntimeVariable(
      'NEXT_PUBLIC_GOOGLE_API_KEY'
    ),
  },
}

const stripeEnv = {
  server: {
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    STRIPE_STARTER_PRODUCT_ID: z.string().min(1).optional(),
    STRIPE_STARTER_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_STARTER_YEARLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_STARTER_CHATS_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_STARTER_CHATS_YEARLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_STARTER_STORAGE_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_STARTER_STORAGE_YEARLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_PRODUCT_ID: z.string().min(1).optional(),
    STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_YEARLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_CHATS_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_CHATS_YEARLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_STORAGE_MONTHLY_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_STORAGE_YEARLY_PRICE_ID: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_STRIPE_PUBLIC_KEY: getRuntimeVariable(
      'NEXT_PUBLIC_STRIPE_PUBLIC_KEY'
    ),
  },
}

const s3Env = {
  server: {
    S3_ACCESS_KEY: z.string().min(1).optional(),
    S3_SECRET_KEY: z.string().min(1).optional(),
    S3_BUCKET: z.string().min(1).optional().default('typebot'),
    S3_PORT: z.coerce.number().optional(),
    S3_ENDPOINT: z.string().min(1).optional(),
    S3_SSL: boolean.optional().default('true'),
    S3_REGION: z.string().min(1).optional(),
    S3_PUBLIC_CUSTOM_DOMAIN: z.string().url().optional(),
  },
}

const giphyEnv = {
  client: {
    NEXT_PUBLIC_GIPHY_API_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_GIPHY_API_KEY: getRuntimeVariable('NEXT_PUBLIC_GIPHY_API_KEY'),
  },
}

const vercelEnv = {
  server: {
    VERCEL_TOKEN: z.string().min(1).optional(),
    VERCEL_TEAM_ID: z.string().min(1).optional(),
    VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().min(1).optional(),
    NEXT_PUBLIC_VERCEL_ENV: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME: getRuntimeVariable(
      'NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME'
    ),
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: getRuntimeVariable(
      'NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA'
    ),
    NEXT_PUBLIC_VERCEL_ENV: getRuntimeVariable('NEXT_PUBLIC_VERCEL_ENV'),
  },
}

const sleekPlanEnv = {
  server: {
    SLEEKPLAN_SSO_KEY: z.string().min(1).optional(),
  },
}

const unsplashEnv = {
  client: {
    NEXT_PUBLIC_UNSPLASH_APP_NAME: z.string().min(1).optional(),
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_UNSPLASH_APP_NAME: getRuntimeVariable(
      'NEXT_PUBLIC_UNSPLASH_APP_NAME'
    ),
    NEXT_PUBLIC_UNSPLASH_ACCESS_KEY: getRuntimeVariable(
      'NEXT_PUBLIC_UNSPLASH_ACCESS_KEY'
    ),
  },
}

const whatsAppEnv = {
  server: {
    META_SYSTEM_USER_TOKEN: z.string().min(1).optional(),
    WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID: z.string().min(1).optional(),
  },
}

const upstashRedis = {
  server: {
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  },
}

const sentryEnv = {
  client: {
    NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  },
  server: {
    SENTRY_AUTH_TOKEN: z.string().min(1).optional(),
    SENTRY_PROJECT: z.string().min(1).optional(),
    SENTRY_ORG: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_SENTRY_DSN: getRuntimeVariable('NEXT_PUBLIC_SENTRY_DSN'),
  },
}

const telemetryEnv = {
  server: {
    TELEMETRY_WEBHOOK_URL: z.string().url().optional(),
    TELEMETRY_WEBHOOK_BEARER_TOKEN: z.string().min(1).optional(),
    USER_CREATED_WEBHOOK_URL: z.string().url().optional(),
  },
}

const posthogEnv = {
  client: {
    NEXT_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z
      .string()
      .min(1)
      .optional()
      .default('https://app.posthog.com'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_POSTHOG_KEY: getRuntimeVariable('NEXT_PUBLIC_POSTHOG_KEY'),
    NEXT_PUBLIC_POSTHOG_HOST: getRuntimeVariable('NEXT_PUBLIC_POSTHOG_HOST'),
  },
}

export const env = createEnv({
  server: {
    ...baseEnv.server,
    ...githubEnv.server,
    ...facebookEnv.server,
    ...smtpEnv.server,
    ...googleEnv.server,
    ...stripeEnv.server,
    ...s3Env.server,
    ...vercelEnv.server,
    ...sleekPlanEnv.server,
    ...whatsAppEnv.server,
    ...upstashRedis.server,
    ...gitlabEnv.server,
    ...azureEnv.server,
    ...customOAuthEnv.server,
    ...sentryEnv.server,
    ...telemetryEnv.server,
  },
  client: {
    ...baseEnv.client,
    ...smtpEnv.client,
    ...googleEnv.client,
    ...stripeEnv.client,
    ...giphyEnv.client,
    ...vercelEnv.client,
    ...unsplashEnv.client,
    ...sentryEnv.client,
    ...posthogEnv.client,
  },
  experimental__runtimeEnv: {
    ...baseEnv.runtimeEnv,
    ...smtpEnv.runtimeEnv,
    ...googleEnv.runtimeEnv,
    ...stripeEnv.runtimeEnv,
    ...giphyEnv.runtimeEnv,
    ...vercelEnv.runtimeEnv,
    ...unsplashEnv.runtimeEnv,
    ...sentryEnv.runtimeEnv,
    ...posthogEnv.runtimeEnv,
  },
  skipValidation: typeof window !== 'undefined' && window.__ENV === undefined,
  onInvalidAccess: (variable: string) => {
    throw new Error(
      `❌ Attempted to access a server-side environment variable on the client: ${variable}`
    )
  },
})
