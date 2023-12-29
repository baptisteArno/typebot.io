import { publicProcedure } from '@/helpers/server/trpc'
import { chatLogSchema } from '@typebot.io/schemas/features/chat/schema'
import { TRPCError } from '@trpc/server'
import { getSession } from '@typebot.io/bot-engine/queries/getSession'
import { z } from 'zod'
import { saveLogs } from '@typebot.io/bot-engine/queries/saveLogs'
import { formatLogDetails } from '@typebot.io/bot-engine/logs/helpers/formatLogDetails'
import * as Sentry from '@sentry/nextjs'

export const saveClientLogs = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/sessions/{sessionId}/clientLogs',
      summary: 'Save logs',
    },
  })
  .input(
    z.object({
      sessionId: z.string(),
      clientLogs: z.array(chatLogSchema),
    })
  )
  .output(z.object({ message: z.string() }))
  .mutation(async ({ input: { sessionId, clientLogs } }) => {
    const session = await getSession(sessionId)

    if (!session) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Session not found.',
      })
    }

    const resultId = session.state.typebotsQueue[0].resultId

    if (!resultId) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Result not found.',
      })
    }

    try {
      await saveLogs(
        clientLogs.map((log) => ({
          ...log,
          resultId,
          details: formatLogDetails(log.details),
        }))
      )
      return {
        message: 'Logs successfully saved.',
      }
    } catch (e) {
      console.error('Failed to save logs', e)
      Sentry.captureException(e)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to save logs.',
      })
    }
  })
