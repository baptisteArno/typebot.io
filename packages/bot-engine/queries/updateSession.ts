import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  id: string
  state: SessionState
}

export const updateSession = ({
  id,
  state,
}: Props): Prisma.PrismaPromise<any> =>
  prisma.chatSession.updateMany({
    where: { id },
    data: {
      state,
    },
  })
