import prisma from '@sniper.io/lib/prisma'
import { Prisma } from '@sniper.io/prisma'
import { SessionState } from '@sniper.io/schemas'

type Props = {
  id?: string
  state: SessionState
  isReplying?: boolean
}

export const createSession = ({
  id,
  state,
  isReplying,
}: Props): Prisma.PrismaPromise<any> => {
  if (!id) {
    return prisma.chatSession.create({
      data: {
        id,
        state,
        isReplying,
      },
    })
  }
  return prisma.chatSession.upsert({
    where: { id },
    update: {
      state,
      isReplying,
    },
    create: {
      id,
      state,
      isReplying,
    },
  })
}
