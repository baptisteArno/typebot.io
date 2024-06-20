import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isWriteSniperForbidden } from '../helpers/isWriteSniperForbidden'

export const unpublishSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/snipers/{sniperId}/unpublish',
      protect: true,
      summary: 'Unpublish a sniper',
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
      include: {
        collaborators: true,
        publishedSniper: true,
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
      },
    })
    if (!existingSniper?.publishedSniper)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Published sniper not found',
      })

    if (
      !existingSniper.id ||
      (await isWriteSniperForbidden(existingSniper, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    await prisma.publicSniper.deleteMany({
      where: {
        id: existingSniper.publishedSniper.id,
      },
    })

    return { message: 'success' }
  })
