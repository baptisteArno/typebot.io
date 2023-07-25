import prisma from '@/lib/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  id: string
  state: SessionState
}

export const updateSession = async ({ id, state }: Props) =>
  prisma.chatSession.updateMany({
    where: { id },
    data: {
      state,
    },
  })
