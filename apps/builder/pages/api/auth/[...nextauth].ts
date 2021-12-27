import NextAuth, { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import EmailProvider from 'next-auth/providers/email'
import GitHubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from 'libs/prisma'
import { Provider } from 'next-auth/providers'
import { User } from 'db'
import { NextApiRequest, NextApiResponse } from 'next'

const providers: Provider[] = [
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
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

if (process.env.NODE_ENV !== 'production')
  providers.push(
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@email.com',
        },
      },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        })
        return user
      },
    })
  )

const createOptions = (req: NextApiRequest): NextAuthOptions => ({
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  providers,
  session: {
    strategy: process.env.NODE_ENV === 'production' ? 'database' : 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (req.url === '/api/auth/session?update' && token.user) {
        token.user = await prisma.user.findUnique({
          where: { id: (token.user as User).id },
        })
      } else if (user) {
        token.user = user
      }
      account?.type && (token.providerType = account?.type)
      return token
    },
    session: async ({ session, token, user }) => {
      token?.user ? (session.user = token.user as User) : (session.user = user)
      return { ...session, providerType: token.providerType }
    },
  },
})

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  NextAuth(req, res, createOptions(req))
}
export default handler
