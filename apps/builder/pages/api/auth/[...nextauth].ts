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

const providers: Provider[] = [
  EmailProvider({
    server: {
      host: process.env.AUTH_EMAIL_SERVER_HOST,
      port: Number(process.env.AUTH_EMAIL_SERVER_PORT),
      auth: {
        user: process.env.AUTH_EMAIL_SERVER_USER,
        pass: process.env.AUTH_EMAIL_SERVER_PASSWORD,
      },
    },
    from: `"${process.env.AUTH_EMAIL_FROM_NAME}" <${process.env.AUTH_EMAIL_FROM_EMAIL}>`,
  }),
]

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  )

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET)
  providers.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  )

const handler = (req: NextApiRequest, res: NextApiResponse) => {
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
