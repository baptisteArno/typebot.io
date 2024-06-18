import prisma from '@sniper.io/lib/prisma'
import { Prisma } from '@sniper.io/prisma'
import { SessionState } from '@sniper.io/schemas'

type Props = {
  id: string
  state: SessionState
  isReplying: boolean | undefined
}

export const updateSession = ({
  id,
  state,
  isReplying,
}: Props): Prisma.PrismaPromise<any> =>
  prisma.chatSession.updateMany({
    where: { id },
    data: {
      state,
      isReplying,
    },
  })
