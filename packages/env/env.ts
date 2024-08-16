import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'
import { getRuntimeVariable } from './getRuntimeVariable'

declare const window: {
  __ENV?: any
}

const guessNextAuthUrlForVercelPreview = (val: unknown) => {
  if (
    (val && typeof val === 'string' && val.length > 0) ||
    process.env.VERCEL_ENV !== 'preview' ||
    !process.env.VERCEL_BUILDER_PROJECT_NAME ||
    !process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME
  )
    return val
  const isBuilder = (process.env.VERCEL_BRANCH_URL as string).includes(
    process.env.VERCEL_BUILDER_PROJECT_NAME
  )
  if (isBuilder) return `https://${process.env.VERCEL_BRANCH_URL}`
  return `https://${process.env.VERCEL_BRANCH_URL}`.replace(
    process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME,
    process.env.VERCEL_BUILDER_PROJECT_NAME
  )
}

const guessViewerUrlForVercelPreview = (val: unknown) => {
  if (
    (val && typeof val === 'string' && val.length > 0) ||
    process.env.VERCEL_ENV !== 'preview' ||
    !process.env.VERCEL_BUILDER_PROJECT_NAME ||
    !process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME
  )
    return val
  const isViewer = (process.env.VERCEL_BRANCH_URL as string).includes(
    process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME
  )
  if (isViewer) return `https://${process.env.VERCEL_BRANCH_URL}`
  return `https://${process.env.VERCEL_BRANCH_URL}`.replace(
    process.env.VERCEL_BUILDER_PROJECT_NAME,
    process.env.NEXT_PUBLIC_VERCEL_VIEWER_PROJECT_NAME
  )
}

const guessLandingUrlForVercelPreview = (val: unknown) => {
  if (
    (val && typeof val === 'string' && val.length > 0) ||
    process.env.VERCEL_ENV !== 'preview' ||
    !process.env.VERCEL_LANDING_PROJECT_NAME
  )
    return val
  return `https://${process.env.VERCEL_BRANCH_URL}`
}

const boolean = z.enum(['true', 'false']).transform((value) => value === 'true')

const baseEnv = {
  server: {
    NODE_ENV: z
      .enum(['development', 'staging', 'production', 'test'])
      .optional(),
    DATABASE_URL: z
      .string()
      .url()
      .refine((url) => url.startsWith('postgres') || url.startsWith('mysql')),
    ENCRYPTION_SECRET: z.string().length(32),
    NEXTAUTH_URL: z.preprocess(
      guessNextAuthUrlForVercelPreview,
      z.string().url()
    ),
    DISABLE_SIGNUP: boolean.optional().default('false'),
    ADMIN_EMAIL: z
      .string()
      .min(1)
      .optional()
      .transform((val) => val?.split(',')),
    DEFAULT_WORKSPACE_PLAN: z
      .enum(['FREE', 'STARTER', 'PRO', 'LIFETIME', 'UNLIMITED'])
      .refine((str) =>
        ['FREE', 'STARTER', 'PRO', 'LIFETIME', 'UNLIMITED'].includes(str)
      )
      .default('FREE'),
    DEBUG: boolean.optional().default('false'),
    CHAT_API_TIMEOUT: z.coerce.number().optional(),
    RADAR_HIGH_RISK_KEYWORDS: z
      .string()
      .min(1)
      .transform((val) => val.split(','))
      .optional(),
    RADAR_INTERMEDIATE_RISK_KEYWORDS: z
      .string()
      .min(1)
      .transform((val) => val.split(','))
      .optional(),
    RADAR_CUMULATIVE_KEYWORDS: z
      .string()
      .min(1)
      .transform((val) =>
        val.split('/').map((s) => s.split(',').map((s) => s.split('|')))
      )
      .optional(),
    LANDING_PAGE_URL: z.preprocess(
      guessLandingUrlForVercelPreview,
      z.string().url().optional()
    ),
  },
  client: {
    NEXT_PUBLIC_E2E_TEST: boolean.optional(),
    NEXT_PUBLIC_VIEWER_URL: z.preprocess(
      guessViewerUrlForVercelPreview,
      z
        .string()
        .min(1)
        .transform((val) => val.split(','))
    ),
    NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID: z.string().min(1).optional(),
    NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE: z.coerce.number().optional(),
    NEXT_PUBLIC_CHAT_API_URL: z.string().url().optional(),
    // To remove to deploy chat API for all typebots
    NEXT_PUBLIC_USE_EXPERIMENTAL_CHAT_API_ON: z
      .string()
      .min(1)
      .transform((val) =>
        val.split('/').map((s) => s.split(',').map((s) => s.split('|')))
      )
      .optional(),
    NEXT_PUBLIC_VIEWER_404_TITLE: z.string().optional().default('404'),
    NEXT_PUBLIC_VIEWER_404_SUBTITLE: z
      .string()
      .optional()
      .default("The bot you're looking for doesn't exist"),
  },
  runtimeEnv: {
    NEXT_PUBLIC_E2E_TEST: getRuntimeVariable('NEXT_PUBLIC_E2E_TEST'),
    NEXT_PUBLIC_VIEWER_URL: getRuntimeVariable('NEXT_PUBLIC_VIEWER_URL'),
    NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID: getRuntimeVariable(
      'NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID'
    ),
    NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE: getRuntimeVariable(
      'NEXT_PUBLIC_BOT_FILE_UPLOAD_MAX_SIZE'
    ),
    NEXT_PUBLIC_CHAT_API_URL: getRuntimeVariable('NEXT_PUBLIC_CHAT_API_URL'),
    NEXT_PUBLIC_USE_EXPERIMENTAL_CHAT_API_ON: getRuntimeVariable(
      'NEXT_PUBLIC_USE_EXPERIMENTAL_CHAT_API_ON'
    ),
    NEXT_PUBLIC_VIEWER_404_TITLE: getRuntimeVariable(
      'NEXT_PUBLIC_VIEWER_404_TITLE'
    ),
    NEXT_PUBLIC_VIEWER_404_SUBTITLE: getRuntimeVariable(
      'NEXT_PUBLIC_VIEWER_404_SUBTITLE'
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
    STRIPE_STARTER_PRICE_ID: z.string().min(1).optional(),
    STRIPE_STARTER_CHATS_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_PRICE_ID: z.string().min(1).optional(),
    STRIPE_PRO_CHATS_PRICE_ID: z.string().min(1).optional(),
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
    VERCEL_BUILDER_PROJECT_NAME: z.string().min(1).optional(),
    VERCEL_LANDING_PROJECT_NAME: z.string().min(1).optional(),
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

const pexelsEnv = {
  client: {
    NEXT_PUBLIC_PEXELS_API_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_PEXELS_API_KEY: getRuntimeVariable(
      'NEXT_PUBLIC_PEXELS_API_KEY'
    ),
  },
}

const whatsAppEnv = {
  server: {
    META_SYSTEM_USER_TOKEN: z.string().min(1).optional(),
    WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID: z.string().min(1).optional(),
    WHATSAPP_PREVIEW_TEMPLATE_NAME: z.string().min(1).optional(),
    WHATSAPP_PREVIEW_TEMPLATE_LANG: z
      .string()
      .min(1)
      .optional()
      .default('en_US'),
    WHATSAPP_CLOUD_API_URL: z
      .string()
      .url()
      .optional()
      .default('https://graph.facebook.com'),
    WHATSAPP_INTERACTIVE_GROUP_SIZE: z.coerce.number().optional().default(3),
  },
}

const redisEnv = {
  server: {
    REDIS_URL: z.string().url().optional(),
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
    MESSAGE_WEBHOOK_URL: z.string().url().optional(),
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

const tolgeeEnv = {
  client: {
    NEXT_PUBLIC_TOLGEE_API_KEY: z.string().min(1).optional(),
    NEXT_PUBLIC_TOLGEE_API_URL: z
      .string()
      .url()
      .optional()
      .default('https://tolgee.server.baptistearno.com"'),
  },
  runtimeEnv: {
    NEXT_PUBLIC_TOLGEE_API_KEY: getRuntimeVariable(
      'NEXT_PUBLIC_TOLGEE_API_KEY'
    ),
    NEXT_PUBLIC_TOLGEE_API_URL: getRuntimeVariable(
      'NEXT_PUBLIC_TOLGEE_API_URL',
      'https://tolgee.server.baptistearno.com'
    ),
  },
}

const keycloakEnv = {
  server: {
    KEYCLOAK_CLIENT_ID: z.string().min(1).optional(),
    KEYCLOAK_CLIENT_SECRET: z.string().min(1).optional(),
    KEYCLOAK_REALM: z.string().min(1).optional(),
    KEYCLOAK_BASE_URL: z.string().url().optional(),
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
    ...redisEnv.server,
    ...gitlabEnv.server,
    ...azureEnv.server,
    ...customOAuthEnv.server,
    ...sentryEnv.server,
    ...telemetryEnv.server,
    ...keycloakEnv.server,
  },
  client: {
    ...baseEnv.client,
    ...smtpEnv.client,
    ...googleEnv.client,
    ...stripeEnv.client,
    ...giphyEnv.client,
    ...vercelEnv.client,
    ...unsplashEnv.client,
    ...pexelsEnv.client,
    ...sentryEnv.client,
    ...posthogEnv.client,
    ...tolgeeEnv.client,
  },
  experimental__runtimeEnv: {
    ...baseEnv.runtimeEnv,
    ...smtpEnv.runtimeEnv,
    ...googleEnv.runtimeEnv,
    ...stripeEnv.runtimeEnv,
    ...giphyEnv.runtimeEnv,
    ...vercelEnv.runtimeEnv,
    ...unsplashEnv.runtimeEnv,
    ...pexelsEnv.runtimeEnv,
    ...sentryEnv.runtimeEnv,
    ...posthogEnv.runtimeEnv,
    ...tolgeeEnv.runtimeEnv,
  },
  skipValidation:
    process.env.SKIP_ENV_CHECK === 'true' ||
    (typeof window !== 'undefined' && window.__ENV === undefined),
  onValidationError(error) {
    console.error(
      '❌ Invalid environment variables:',
      error.flatten().fieldErrors
    )
    throw new Error(
      `Invalid environment variables: ${JSON.stringify(
        error.flatten().fieldErrors
      )}`
    )
  },
  onInvalidAccess: (variable: string) => {
    throw new Error(
      `❌ Attempted to access a server-side environment variable on the client: ${variable}`
    )
  },
})
