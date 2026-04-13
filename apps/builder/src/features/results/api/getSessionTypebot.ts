import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadTypebotForbidden } from '@/features/typebot/helpers/isReadTypebotForbidden'

export const getSessionTypebot = authenticatedProcedure
  .input(
    z.object({
      typebotId: z.string(),
      resultId: z.string(),
    })
  )
  .output(
    z.object({
      typebot: z.any().nullable(),
    })
  )
  .query(async ({ input, ctx: { user } }) => {
    const typebot = await prisma.typebot.findUnique({
      where: { id: input.typebotId },
      select: {
        id: true,
        groups: true,
        workspace: {
          select: {
            id: true,
            isSuspended: true,
            isPastDue: true,
            members: { select: { userId: true } },
          },
        },
        collaborators: { select: { userId: true, type: true } },
      },
    })
    if (!typebot || (await isReadTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const result = await prisma.result.findFirst({
      where: { id: input.resultId, typebotId: input.typebotId },
      select: { lastChatSessionId: true },
    })
    if (!result?.lastChatSessionId) return { typebot: null }

    const session = await prisma.chatSession.findUnique({
      where: { id: result.lastChatSessionId },
      select: { state: true },
    })
    if (!session?.state) return { typebot: null }

    const state = session.state as any

    // v3 and v2 store the typebot in typebotsQueue[0].typebot
    if (state.typebotsQueue?.[0]?.typebot) {
      return { typebot: state.typebotsQueue[0].typebot }
    }
    // v1 stores it in state.typebot
    if (state.typebot) {
      return { typebot: state.typebot }
    }

    return { typebot: null }
  })
