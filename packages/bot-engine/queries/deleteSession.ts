import prisma from '@sniper.io/lib/prisma'

export const deleteSession = (id: string) =>
  prisma.chatSession.deleteMany({
    where: {
      id,
    },
  })
