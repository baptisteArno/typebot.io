import prisma from '@typebot.io/lib/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  id?: string
  state: SessionState
}

export const restartSession = async ({ id, state }: Props) => {
  if (id) {
    await prisma.chatSession.deleteMany({
      where: {
        id,
      },
    })
  }

  return prisma.chatSession.create({
    data: {
      id,
      state,
    },
  })
}
