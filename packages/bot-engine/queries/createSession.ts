import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  id?: string
  state: SessionState
}

export const createSession = ({
  id,
  state,
}: Props): Prisma.PrismaPromise<any> =>
  prisma.chatSession.create({
    data: {
      id,
      state,
    },
  })
