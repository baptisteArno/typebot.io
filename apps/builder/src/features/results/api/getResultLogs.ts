import { getTypebot } from '@/features/typebot/helpers/getTypebot'
import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { logSchema } from '@typebot.io/schemas'
import { z } from 'zod'

export const getResultLogs = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/results/{resultId}/logs',
      protect: true,
      summary: 'List result logs',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      resultId: z.string(),
    })
  )
  .output(z.object({ logs: z.array(logSchema) }))
  .query(async ({ input: { typebotId, resultId }, ctx: { user } }) => {
    const typebot = await getTypebot({
      accessLevel: 'read',
      user,
      typebotId,
    })
    if (!typebot) throw new Error('Typebot not found')
    const logs = await prisma.log.findMany({
      where: {
        resultId,
      },
    })

    return { logs }
  })
