import NextAuth from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
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

export default withSentry(handler)
