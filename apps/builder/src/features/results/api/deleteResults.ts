import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Group } from '@typebot.io/schemas'
import { z } from 'zod'
import { archiveResults } from '@typebot.io/lib/api/helpers/archiveResults'
import prisma from '@/lib/prisma'
import { isWriteTypebotForbidden } from '@/features/typebot/helpers/isWriteTypebotForbidden'

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
        workspaceId: true,
        groups: true,
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
        groups: typebot.groups as Group[],
      },
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
