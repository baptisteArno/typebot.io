// Forked from https://github.com/nextauthjs/adapters/blob/main/packages/prisma/src/index.ts
import { PrismaClient, Prisma, Invitation, Plan } from 'db'
import { randomUUID } from 'crypto'
import type { Adapter, AdapterUser } from 'next-auth/adapters'
import cuid from 'cuid'
import { got } from 'got'

export function CustomAdapter(p: PrismaClient): Adapter {
  return {
    createUser: async (data: Omit<AdapterUser, 'id'>) => {
      const user = { id: cuid(), email: data.email as string }
      const invitations = await p.invitation.findMany({
        where: { email: user.email },
      })
      const createdUser = await p.user.create({
        data: {
          ...data,
          id: user.id,
          apiToken: randomUUID(),
          plan: process.env.ADMIN_EMAIL === data.email ? Plan.PRO : Plan.FREE,
        },
      })
      if (process.env.USER_CREATED_WEBHOOK_URL)
        await got.post(process.env.USER_CREATED_WEBHOOK_URL, {
          json: {
            email: data.email,
            name: data.name ? (data.name as string).split(' ')[0] : undefined,
          },
        })
      if (invitations.length > 0)
        await convertInvitationsToCollaborations(p, user, invitations)
      return createdUser
    },
    getUser: (id) => p.user.findUnique({ where: { id } }),
    getUserByEmail: (email) => p.user.findUnique({ where: { email } }),
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      })
      return account?.user ?? null
    },
    updateUser: (data) => p.user.update({ where: { id: data.id }, data }),
    deleteUser: (id) => p.user.delete({ where: { id } }),
    linkAccount: (data) => p.account.create({ data }) as any,
    unlinkAccount: (provider_providerAccountId) =>
      p.account.delete({ where: { provider_providerAccountId } }) as any,
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session }
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) =>
      p.session.update({ data, where: { sessionToken: data.sessionToken } }),
    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),
    createVerificationToken: (data) => p.verificationToken.create({ data }),
    async useVerificationToken(identifier_token) {
      try {
        return await p.verificationToken.delete({ where: { identifier_token } })
      } catch (error) {
        if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025')
          return null
        throw error
      }
    },
  }
}

const convertInvitationsToCollaborations = async (
  p: PrismaClient,
  { id, email }: { id: string; email: string },
  invitations: Invitation[]
) => {
  await p.collaboratorsOnTypebots.createMany({
    data: invitations.map((invitation) => ({
      typebotId: invitation.typebotId,
      type: invitation.type,
      userId: id,
    })),
  })
  return p.invitation.deleteMany({
    where: {
      email,
    },
  })
}
