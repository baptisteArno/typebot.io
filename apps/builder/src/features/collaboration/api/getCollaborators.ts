import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { collaboratorSchema } from '@sniper.io/schemas/features/collaborators'
import { isReadSniperForbidden } from '@/features/sniper/helpers/isReadSniperForbidden'

export const getCollaborators = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers/{sniperId}/collaborators',
      protect: true,
      summary: 'Get collaborators',
      tags: ['Collaborators'],
    },
  })
  .input(
    z.object({
      sniperId: z.string(),
    })
  )
  .output(
    z.object({
      collaborators: z.array(collaboratorSchema),
    })
  )
  .query(async ({ input: { sniperId }, ctx: { user } }) => {
    const existingSniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
      },
      include: {
        collaborators: true,
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
      },
    })
    if (
      !existingSniper?.id ||
      (await isReadSniperForbidden(existingSniper, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    return {
      collaborators: existingSniper.collaborators,
    }
  })
