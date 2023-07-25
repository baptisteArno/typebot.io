import prisma from '@/lib/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  state: SessionState
}

export const createSession = async ({ state }: Props) =>
  prisma.chatSession.create({
    data: {
      state,
    },
  })
