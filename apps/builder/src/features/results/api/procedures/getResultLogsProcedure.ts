import prisma from '@/lib/prisma'
import { canReadTypebot } from '@/utils/api/dbRules'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { logSchema } from 'models'
import { z } from 'zod'

export const getResultLogsProcedure = authenticatedProcedure
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
    const logs = await prisma.log.findMany({
      where: {
        result: { id: resultId, typebot: canReadTypebot(typebotId, user) },
      },
    })

    return { logs }
  })
