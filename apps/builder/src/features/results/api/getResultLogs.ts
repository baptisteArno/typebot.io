import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { logSchema } from '@sniper.io/schemas'
import { z } from 'zod'
import { isReadSniperForbidden } from '@/features/sniper/helpers/isReadSniperForbidden'

export const getResultLogs = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/results/{resultId}/logs',
      protect: true,
      summary: 'List result logs',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      sniperId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-sniperid)"
        ),
      resultId: z.string(),
    })
  )
  .output(z.object({ logs: z.array(logSchema) }))
  .query(async ({ input: { sniperId, resultId }, ctx: { user } }) => {
    const sniper = await prisma.sniper.findUnique({
      where: {
        id: sniperId,
      },
      select: {
        id: true,
        groups: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
              },
            },
          },
        },
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })
    if (!sniper || (await isReadSniperForbidden(sniper, user)))
      throw new Error('Sniper not found')
    const logs = await prisma.log.findMany({
      where: {
        resultId,
      },
    })

    return { logs }
  })
