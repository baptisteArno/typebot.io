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
    state: sessionStateSchema.parse(patchSessionState(session.state)),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patchSessionState = (state: any) => {
  if (!state) return state
  if (state.typebotsQueue) {
    return {
      ...state,
      typebotsQueue: state.typebotsQueue.map((item: any) => ({
        ...item,
        typebot: patchTypebot(item.typebot),
      })),
    }
  }
  if (state.typebot) {
    return {
      ...state,
      typebot: patchTypebot(state.typebot),
    }
  }
  return state
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const patchTypebot = (typebot: any) => {
  if (!typebot) return typebot
  return {
    ...typebot,
    typebotId: typebot.typebotId ?? typebot.id,
  }
}
