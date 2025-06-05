// Forked from https://github.com/nextauthjs/adapters/blob/main/packages/prisma/src/index.ts
import { PrismaClient, Prisma, Session } from '@typebot.io/prisma'
import type { Adapter, AdapterUser } from 'next-auth/adapters'

export function customAdapter(p: PrismaClient): Adapter {
  return {
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      })
      if (!userAndSession) return null
      const { user, ...session } = userAndSession
      return { user, session } as { user: AdapterUser; session: Session }
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
    // Métodos obrigatórios da interface Adapter
    createUser: async () => {
      throw new Error('Not implemented')
    },
    getUser: async () => {
      throw new Error('Not implemented')
    },
    getUserByEmail: async () => {
      throw new Error('Not implemented')
    },
    getUserByAccount: async () => {
      throw new Error('Not implemented')
    },
    updateUser: async () => {
      throw new Error('Not implemented')
    },
    deleteUser: async () => {
      throw new Error('Not implemented')
    },
    linkAccount: async () => {
      throw new Error('Not implemented')
    },
    unlinkAccount: async () => {
      throw new Error('Not implemented')
    },
  }
}
