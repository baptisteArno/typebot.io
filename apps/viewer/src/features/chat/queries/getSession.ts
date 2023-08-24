import prisma from '@/lib/prisma'
import { ChatSession, sessionStateSchema } from '@typebot.io/schemas'

export const getSession = async (
  sessionId: string
): Promise<Pick<ChatSession, 'state' | 'id'> | null> => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true },
  })
  if (!session) return null
  return { ...session, state: sessionStateSchema.parse(session.state) }
}
