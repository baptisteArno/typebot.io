import prisma from '@typebot.io/lib/prisma'
import { sessionStateSchema } from '@typebot.io/schemas'
import { deleteSession } from './deleteSession'

export const getSession = async (sessionId: string) => {
  const session = await prisma.chatSession.findUnique({
    where: { id: sessionId },
    select: { id: true, state: true, updatedAt: true, isReplying: true },
  })
  if (!session?.state) return null
  if (Object.keys(session.state).length === 0) {
    await deleteSession(session.id)
    return null
  }
  return {
    ...session,
    state: sessionStateSchema.parse(session.state),
  }
}
