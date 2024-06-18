import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { archiveResults } from '@sniper.io/results/archiveResults'
import prisma from '@sniper.io/lib/prisma'
import { isWriteSniperForbidden } from '@/features/sniper/helpers/isWriteSniperForbidden'
import { Sniper } from '@sniper.io/schemas'

export const deleteResults = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/snipers/{sniperId}/results',
      protect: true,
      summary: 'Delete results',
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
      resultIds: z
        .string()
        .describe(
          'Comma separated list of ids. If not provided, all results will be deleted. ⚠️'
        )
        .optional(),
    })
  )
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {
    const idsArray = input.resultIds?.split(',')
    const { sniperId } = input
    const sniper = await prisma.sniper.findUnique({
      where: {
        id: sniperId,
      },
      select: {
        groups: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
                role: true,
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
    if (!sniper || (await isWriteSniperForbidden(sniper, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })
    const { success } = await archiveResults(prisma)({
      sniper: {
        groups: sniper.groups,
      } as Pick<Sniper, 'groups'>,
      resultsFilter: {
        id: (idsArray?.length ?? 0) > 0 ? { in: idsArray } : undefined,
        sniperId,
      },
    })

    if (!success)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Sniper not found',
      })
  })
