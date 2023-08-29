import prisma from '@/lib/prisma'
import { SessionState } from '@typebot.io/schemas'

type Props = {
  id?: string
  state: SessionState
}

export const createSession = async ({ id, state }: Props) =>
  prisma.chatSession.create({
    data: {
      id,
      state,
    },
  })
