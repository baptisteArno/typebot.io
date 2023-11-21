import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot } from '@typebot.io/schemas'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'
import { archiveResults } from '@typebot.io/lib/api/helpers/archiveResults'

export const deleteTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/typebots/{typebotId}',
      protect: true,
      summary: 'Delete a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
    })
  )
  .output(
    z.object({
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        groups: true,
        workspace: {
          select: {
            isQuarantined: true,
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
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const { success } = await archiveResults(prisma)({
      typebot: {
        groups: existingTypebot.groups,
      } as Pick<Typebot, 'groups'>,
      resultsFilter: { typebotId },
    })
    if (!success)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to archive results',
      })
    await prisma.publicTypebot.deleteMany({
      where: { typebotId },
    })
    await prisma.typebot.updateMany({
      where: { id: typebotId },
      data: { isArchived: true, publicId: null, customDomain: null },
    })
    return {
      message: 'success',
    }
  })
