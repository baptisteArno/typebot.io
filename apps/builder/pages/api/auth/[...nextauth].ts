import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import prisma from 'libs/prisma'
import { Provider } from 'next-auth/providers'
import { NextApiRequest, NextApiResponse } from 'next'
import { isNotDefined } from 'utils'
import { User } from 'db'
import { randomUUID } from 'crypto'
import { withSentry } from '@sentry/nextjs'

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
    adapter: PrismaAdapter(prisma),
    secret: process.env.ENCRYPTION_SECRET,
    providers,
    session: {
      strategy: 'database',
    },
    callbacks: {
      session: async ({ session, user }) => {
        const userFromDb = user as User
        if (isNotDefined(userFromDb.apiToken))
          userFromDb.apiToken = await generateApiToken(userFromDb.id)
        return { ...session, user: userFromDb }
      },
    },
  })
}

const generateApiToken = async (userId: string) => {
  const apiToken = randomUUID()
  await prisma.user.update({
    where: { id: userId },
    data: { apiToken },
  })
  return apiToken
}

export default withSentry(handler)
