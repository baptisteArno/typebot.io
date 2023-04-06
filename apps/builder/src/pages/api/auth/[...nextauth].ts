import NextAuth, { Account, AuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GitlabProvider from 'next-auth/providers/gitlab'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import AzureADProvider from 'next-auth/providers/azure-ad'
import prisma from '@/lib/prisma'
import { Provider } from 'next-auth/providers'
import { NextApiRequest, NextApiResponse } from 'next'
import { customAdapter } from '../../../features/auth/api/customAdapter'
import { User } from '@typebot.io/prisma'
import { env, getAtPath, isDefined, isNotEmpty } from '@typebot.io/lib'
import { mockedUser } from '@/features/auth/mockedUser'
import { getNewUserInvitations } from '@/features/auth/helpers/getNewUserInvitations'
import { sendVerificationRequest } from '@/features/auth/helpers/sendVerificationRequest'

const providers: Provider[] = []

if (
  isNotEmpty(process.env.GITHUB_CLIENT_ID) &&
  isNotEmpty(process.env.GITHUB_CLIENT_SECRET)
)
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )

if (isNotEmpty(env('SMTP_FROM')) && process.env.SMTP_AUTH_DISABLED !== 'true')
  providers.push(
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 25,
        secure: process.env.SMTP_SECURE
          ? process.env.SMTP_SECURE === 'true'
          : false,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: env('SMTP_FROM'),
      sendVerificationRequest,
    })
  )

if (
  isNotEmpty(process.env.GOOGLE_CLIENT_ID) &&
  isNotEmpty(process.env.GOOGLE_CLIENT_SECRET)
)
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )

if (
  isNotEmpty(process.env.FACEBOOK_CLIENT_ID) &&
  isNotEmpty(process.env.FACEBOOK_CLIENT_SECRET)
)
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )

if (
  isNotEmpty(process.env.GITLAB_CLIENT_ID) &&
  isNotEmpty(process.env.GITLAB_CLIENT_SECRET)
) {
  const BASE_URL = process.env.GITLAB_BASE_URL || 'https://gitlab.com'
  providers.push(
    GitlabProvider({
      clientId: process.env.GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET,
      authorization: `${BASE_URL}/oauth/authorize?scope=read_api`,
      token: `${BASE_URL}/oauth/token`,
      userinfo: `${BASE_URL}/api/v4/user`,
      name: process.env.GITLAB_NAME || 'GitLab',
    })
  )
}

if (
  isNotEmpty(process.env.AZURE_AD_CLIENT_ID) &&
  isNotEmpty(process.env.AZURE_AD_CLIENT_SECRET) &&
  isNotEmpty(process.env.AZURE_AD_TENANT_ID)
) {
  providers.push(
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    })
  )
}

if (isNotEmpty(process.env.CUSTOM_OAUTH_WELL_KNOWN_URL)) {
  providers.push({
    id: 'custom-oauth',
    name: process.env.CUSTOM_OAUTH_NAME ?? 'Custom OAuth',
    type: 'oauth',
    clientId: process.env.CUSTOM_OAUTH_CLIENT_ID,
    clientSecret: process.env.CUSTOM_OAUTH_CLIENT_SECRET,
    wellKnown: process.env.CUSTOM_OAUTH_WELL_KNOWN_URL,
    profile(profile) {
      return {
        id: getAtPath(profile, process.env.CUSTOM_OAUTH_USER_ID_PATH ?? 'id'),
        name: getAtPath(
          profile,
          process.env.CUSTOM_OAUTH_USER_NAME_PATH ?? 'name'
        ),
        email: getAtPath(
          profile,
          process.env.CUSTOM_OAUTH_USER_EMAIL_PATH ?? 'email'
        ),
        image: getAtPath(
          profile,
          process.env.CUSTOM_OAUTH_USER_IMAGE_PATH ?? 'image'
        ),
      } as User
    },
  })
}

export const authOptions: AuthOptions = {
  adapter: customAdapter(prisma),
  secret: process.env.ENCRYPTION_SECRET,
  providers,
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/signin',
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
      if (!account) return false
      const isNewUser = !('createdAt' in user && isDefined(user.createdAt))
      if (process.env.DISABLE_SIGNUP === 'true' && isNewUser && user.email) {
        const { invitations, workspaceInvitations } =
          await getNewUserInvitations(prisma, user.email)
        if (invitations.length === 0 && workspaceInvitations.length === 0)
          return false
      }
      const requiredGroups = getRequiredGroups(account.provider)
      if (requiredGroups.length > 0) {
        const userGroups = await getUserGroups(account)
        return checkHasGroups(userGroups, requiredGroups)
      }
      return true
    },
  },
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const isMockingSession =
    req.method === 'GET' &&
    req.url === '/api/auth/session' &&
    env('E2E_TEST') === 'true'
  if (isMockingSession) return res.send({ user: mockedUser })
  const requestIsFromCompanyFirewall = req.method === 'HEAD'
  if (requestIsFromCompanyFirewall) return res.status(200).end()
  return await NextAuth(req, res, authOptions)
}

const updateLastActivityDate = async (user: User) => {
  const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()

  if (!datesAreOnSameDay(user.lastActivityAt, new Date()))
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActivityAt: new Date() },
    })
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
            process.env.GITLAB_BASE_URL || 'https://gitlab.com'
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
      return process.env.GITLAB_REQUIRED_GROUPS?.split(',') || []
    default:
      return []
  }
}

const checkHasGroups = (userGroups: string[], requiredGroups: string[]) =>
  userGroups?.some((userGroup) => requiredGroups?.includes(userGroup))

export default handler
