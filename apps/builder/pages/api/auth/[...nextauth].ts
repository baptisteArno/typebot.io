import NextAuth from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import prisma from 'libs/prisma'
import { Provider } from 'next-auth/providers'
import { NextApiRequest, NextApiResponse } from 'next'

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
    // sendVerificationRequest({
    //   identifier: email,
    //   url,
    //   provider: { server, from },
    // }) {
    //   console.log(url)
    // },
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
      session: ({ session, user }) => ({ ...session, user }),
    },
  })
}

export default handler
