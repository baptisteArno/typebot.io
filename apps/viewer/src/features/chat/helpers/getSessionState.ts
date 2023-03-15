import prisma from '@/lib/prisma'
import { ChatSession } from '@typebot.io/schemas'

export const getSession = async (
  sessionId: string
): Promise<Pick<ChatSession, 'state' | 'id'> | null> => {
  const session = (await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true },
  })) as Pick<ChatSession, 'state' | 'id'> | null
  return session
}
