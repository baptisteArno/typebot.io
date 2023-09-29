import prisma from '@typebot.io/lib/prisma'
import { sessionStateSchema } from '@typebot.io/schemas'

export const getSession = async (sessionId: string) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true, updatedAt: true },
  })
  if (!session) return null
  return { ...session, state: sessionStateSchema.parse(session.state) }
}
