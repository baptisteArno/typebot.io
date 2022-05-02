import NextAuth, { Account } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GitlabProvider from 'next-auth/providers/gitlab'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import prisma from 'libs/prisma'
import { Provider } from 'next-auth/providers'
import { NextApiRequest, NextApiResponse } from 'next'
import { withSentry } from '@sentry/nextjs'
import { CustomAdapter } from './adapter'
import { User } from 'db'

const providers: Provider[] = []

if (process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID)
  providers.push(
    GitHubProvider({
      clientId: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )

if (
  process.env.NEXT_PUBLIC_SMTP_FROM &&
  process.env.NEXT_PUBLIC_SMTP_AUTH_DISABLED !== 'true'
)
  providers.push(
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 25,
        auth: {
          user: process.env.SMTP_USERNAME,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.NEXT_PUBLIC_SMTP_FROM,
    })
  )

if (
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
)
  providers.push(
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )

if (
  process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID &&
  process.env.FACEBOOK_CLIENT_SECRET
)
  providers.push(
    FacebookProvider({
      clientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )

if (
  process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID &&
  process.env.GITLAB_CLIENT_SECRET
) {
  const BASE_URL = process.env.GITLAB_BASE_URL || 'https://gitlab.com'
  providers.push(
    GitlabProvider({
      clientId: process.env.NEXT_PUBLIC_GITLAB_CLIENT_ID,
      clientSecret: process.env.GITLAB_CLIENT_SECRET,
      authorization: `${BASE_URL}/oauth/authorize?scope=read_api`,
      token: `${BASE_URL}/oauth/token`,
      userinfo: `${BASE_URL}/api/v4/user`,
    })
  )
}

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'HEAD') {
    res.status(200)
    return
  }
  NextAuth(req, res, {
    adapter: CustomAdapter(prisma),
    secret: process.env.ENCRYPTION_SECRET,
    providers,
    session: {
      strategy: 'database',
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
      signIn: async ({ account }) => {
        const requiredGroups = getRequiredGroups(account.provider)
        if (requiredGroups.length > 0) {
          const userGroups = await getUserGroups(account)
          return checkHasGroups(userGroups, requiredGroups)
        }
        return true
      },
    },
  })
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
      const res = await fetch(
        `${process.env.GITLAB_BASE_URL || 'https://gitlab.com'}/api/v4/groups`,
        { headers: { Authorization: `Bearer ${account.access_token}` } }
      )
      const userGroups = await res.json()
      return userGroups.map((group: { full_path: string }) => group.full_path)
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

export default withSentry(handler)
