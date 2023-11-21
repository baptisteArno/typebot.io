import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { archiveResults } from '@typebot.io/lib/api/helpers/archiveResults'
import prisma from '@typebot.io/lib/prisma'
import { isWriteTypebotForbidden } from '@/features/typebot/helpers/isWriteTypebotForbidden'
import { Typebot } from '@typebot.io/schemas'

export const deleteResults = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/typebots/{typebotId}/results',
      protect: true,
      summary: 'Delete results',
      tags: ['Results'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
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
    const { typebotId } = input
    const typebot = await prisma.typebot.findUnique({
      where: {
        id: typebotId,
      },
      select: {
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
    if (!typebot || (await isWriteTypebotForbidden(typebot, user)))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })
    const { success } = await archiveResults(prisma)({
      typebot: {
        groups: typebot.groups,
      } as Pick<Typebot, 'groups'>,
      resultsFilter: {
        id: (idsArray?.length ?? 0) > 0 ? { in: idsArray } : undefined,
        typebotId,
      },
    })

    if (!success)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Typebot not found',
      })
  })
