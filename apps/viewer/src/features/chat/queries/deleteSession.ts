import prisma from '@/lib/prisma'

export const deleteSession = (id: string) =>
  prisma.chatSession.deleteMany({
    where: {
      id,
    },
  })
