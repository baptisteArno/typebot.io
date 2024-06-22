import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Sniper } from '@sniper.io/schemas'
import { z } from 'zod'
import { isWriteSniperForbidden } from '../helpers/isWriteSniperForbidden'
import { archiveResults } from '@sniper.io/results/archiveResults'

export const deleteSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/snipers/{sniperId}',
      protect: true,
      summary: 'Delete a sniper',
      tags: ['Sniper'],
    },
  })
  .input(
    z.object({
      sniperId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-sniperid)"
        ),
    })
  )
  .output(
    z.object({
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { sniperId }, ctx: { user } }) => {
    const existingSniper = await prisma.sniper.findFirst({
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
    if (
      !existingSniper?.id ||
      (await isWriteSniperForbidden(existingSniper, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    const { success } = await archiveResults(prisma)({
      sniper: {
        groups: existingSniper.groups,
      } as Pick<Sniper, 'groups'>,
      resultsFilter: { sniperId },
    })
    if (!success)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to archive results',
      })
    await prisma.publicSniper.deleteMany({
      where: { sniperId },
    })
    await prisma.sniper.updateMany({
      where: { id: sniperId },
      data: { isArchived: true, publicId: null, customDomain: null },
    })
    return {
      message: 'success',
    }
  })
