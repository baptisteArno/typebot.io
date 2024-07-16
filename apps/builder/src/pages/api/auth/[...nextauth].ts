import NextAuth, { Account, AuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GitlabProvider from 'next-auth/providers/gitlab'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import AzureADProvider from 'next-auth/providers/azure-ad'
import KeycloakProvider from 'next-auth/providers/keycloak'
import prisma from '@typebot.io/lib/prisma'
import { Provider } from 'next-auth/providers'
import { NextApiRequest, NextApiResponse } from 'next'
import { customAdapter } from '../../../features/auth/api/customAdapter'
import { User } from '@typebot.io/prisma'
import { getAtPath, isDefined } from '@typebot.io/lib'
import { mockedUser } from '@typebot.io/lib/mockedUser'
import { getNewUserInvitations } from '@/features/auth/helpers/getNewUserInvitations'
import { sendVerificationRequest } from '@/features/auth/helpers/sendVerificationRequest'
import { Ratelimit } from '@upstash/ratelimit'
import ky from 'ky'
import { env } from '@typebot.io/env'
import * as Sentry from '@sentry/nextjs'
import { getIp } from '@typebot.io/lib/getIp'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'
import Redis from 'ioredis'

const providers: Provider[] = []

let emailSignInRateLimiter: Ratelimit | undefined

if (env.REDIS_URL) {
  const redis = new Redis(env.REDIS_URL)
  const rateLimitCompatibleRedis = {
    sadd: <TData>(key: string, ...members: TData[]) =>
      redis.sadd(key, ...members.map((m) => String(m))),
    eval: async <TArgs extends unknown[], TData = unknown>(
      script: string,
      keys: string[],
      args: TArgs
    ) =>
      redis.eval(
        script,
        keys.length,
        ...keys,
        ...(args ?? []).map((a) => String(a))
      ) as Promise<TData>,
  }
  emailSignInRateLimiter = new Ratelimit({
    redis: rateLimitCompatibleRedis,
    limiter: Ratelimit.slidingWindow(1, '60 s'),
  })
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET)
  providers.push(
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    })
  )

if (env.NEXT_PUBLIC_SMTP_FROM && !env.SMTP_AUTH_DISABLED)
  providers.push(
    EmailProvider({
      server: {
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth:
          env.SMTP_USERNAME || env.SMTP_PASSWORD
            ? {
                user: env.SMTP_USERNAME,
                pass: env.SMTP_PASSWORD,
              }
            : undefined,
      },
      from: env.NEXT_PUBLIC_SMTP_FROM,
      sendVerificationRequest,
    })
  )

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  providers.push(
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    })
  )

if (env.FACEBOOK_CLIENT_ID && env.FACEBOOK_CLIENT_SECRET)
  providers.push(
    FacebookProvider({
      clientId: env.FACEBOOK_CLIENT_ID,
      clientSecret: env.FACEBOOK_CLIENT_SECRET,
    })
  )

if (env.GITLAB_CLIENT_ID && env.GITLAB_CLIENT_SECRET) {
  const BASE_URL = env.GITLAB_BASE_URL
  providers.push(
    GitlabProvider({
      clientId: env.GITLAB_CLIENT_ID,
      clientSecret: env.GITLAB_CLIENT_SECRET,
      authorization: `${BASE_URL}/oauth/authorize?scope=read_api`,
      token: `${BASE_URL}/oauth/token`,
      userinfo: `${BASE_URL}/api/v4/user`,
      name: env.GITLAB_NAME,
    })
  )
}

if (
  env.AZURE_AD_CLIENT_ID &&
  env.AZURE_AD_CLIENT_SECRET &&
  env.AZURE_AD_TENANT_ID
) {
  providers.push(
    AzureADProvider({
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
    })
  )
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
    })
  )
}

if (env.CUSTOM_OAUTH_WELL_KNOWN_URL) {
  providers.push({
    id: 'custom-oauth',
    name: env.CUSTOM_OAUTH_NAME,
    type: 'oauth',
    authorization: {
      params: {
        scope: env.CUSTOM_OAUTH_SCOPE,
      },
    },
    clientId: env.CUSTOM_OAUTH_CLIENT_ID,
    clientSecret: env.CUSTOM_OAUTH_CLIENT_SECRET,
    wellKnown: env.CUSTOM_OAUTH_WELL_KNOWN_URL,
    profile(profile) {
      return {
        id: getAtPath(profile, env.CUSTOM_OAUTH_USER_ID_PATH),
        name: getAtPath(profile, env.CUSTOM_OAUTH_USER_NAME_PATH),
        email: getAtPath(profile, env.CUSTOM_OAUTH_USER_EMAIL_PATH),
        image: getAtPath(profile, env.CUSTOM_OAUTH_USER_IMAGE_PATH),
      } as User
    },
  })
}

export const getAuthOptions = ({
  restricted,
}: {
  restricted?: 'rate-limited'
}): AuthOptions => ({
  adapter: customAdapter(prisma),
  secret: env.ENCRYPTION_SECRET,
  providers,
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/signin',
    newUser: env.NEXT_PUBLIC_ONBOARDING_TYPEBOT_ID ? '/onboarding' : undefined,
    error: '/signin',
  },
  events: {
    signIn({ user }) {
      Sentry.setUser({ id: user.id })
    },
    signOut() {
      Sentry.setUser(null)
    },
  },
  callbacks: {
    session: async ({ session, user }) => {
      const userFromDb = user as User
      await updateLastActivityDate(userFromDb)
      return {
        ...session,
        user: userFromDb,
      }
    },
    signIn: async ({ account, user }) => {
      if (restricted === 'rate-limited') throw new Error('rate-limited')
      if (!account) return false
      const isNewUser = !('createdAt' in user && isDefined(user.createdAt))
      if (
        isNewUser &&
        user.email &&
        (!env.ADMIN_EMAIL || !env.ADMIN_EMAIL.includes(user.email))
      ) {
        const data = await ky
          .get(
            'https://raw.githubusercontent.com/disposable-email-domains/disposable-email-domains/master/disposable_email_blocklist.conf'
          )
          .text()
        const disposableEmailDomains = data.split('\n')
        if (disposableEmailDomains.includes(user.email.split('@')[1]))
          return false
      }
      if (
        env.DISABLE_SIGNUP &&
        isNewUser &&
        user.email &&
        !env.ADMIN_EMAIL?.includes(user.email)
      ) {
        const { invitations, workspaceInvitations } =
          await getNewUserInvitations(prisma, user.email)
        if (invitations.length === 0 && workspaceInvitations.length === 0)
          throw new Error('sign-up-disabled')
      }
      const requiredGroups = getRequiredGroups(account.provider)
      if (requiredGroups.length > 0) {
        const userGroups = await getUserGroups(account)
        return checkHasGroups(userGroups, requiredGroups)
      }
      return true
    },
  },
})

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const isMockingSession =
    req.method === 'GET' &&
    req.url === '/api/auth/session' &&
    env.NEXT_PUBLIC_E2E_TEST
  if (isMockingSession) return res.send({ user: mockedUser })
  const requestIsFromCompanyFirewall = req.method === 'HEAD'
  if (requestIsFromCompanyFirewall) return res.status(200).end()

  let restricted: 'rate-limited' | undefined

  if (
    emailSignInRateLimiter &&
    req.url?.startsWith('/api/auth/signin/email') &&
    req.method === 'POST'
  ) {
    const ip = getIp(req)
    if (ip) {
      const { success } = await emailSignInRateLimiter.limit(ip)
      if (!success) restricted = 'rate-limited'
    }
  }

  return await NextAuth(req, res, getAuthOptions({ restricted }))
}

const updateLastActivityDate = async (user: User) => {
  const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()

  if (!datesAreOnSameDay(user.lastActivityAt, new Date())) {
    await prisma.user.updateMany({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    })
    await trackEvents([
      {
        name: 'User logged in',
        userId: user.id,
      },
    ])
  }
}

const getUserGroups = async (account: Account): Promise<string[]> => {
  switch (account.provider) {
    case 'gitlab': {
      const getGitlabGroups = async (
        accessToken: string,
        page = 1
      ): Promise<{ full_path: string }[]> => {
        const res = await fetch(
          `${
            env.GITLAB_BASE_URL || 'https://gitlab.com'
          }/api/v4/groups?per_page=100&page=${page}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const groups: { full_path: string }[] = await res.json()
        const nextPage = parseInt(res.headers.get('X-Next-Page') || '')
        if (nextPage)
          groups.push(...(await getGitlabGroups(accessToken, nextPage)))
        return groups
      }
      const groups = await getGitlabGroups(account.access_token as string)
      return groups.map((group) => group.full_path)
    }
    default:
      return []
  }
}

const getRequiredGroups = (provider: string): string[] => {
  switch (provider) {
    case 'gitlab':
      return env.GITLAB_REQUIRED_GROUPS ?? []
    default:
      return []
  }
}

const checkHasGroups = (userGroups: string[], requiredGroups: string[]) =>
  userGroups?.some((userGroup) => requiredGroups?.includes(userGroup))

export default handler
