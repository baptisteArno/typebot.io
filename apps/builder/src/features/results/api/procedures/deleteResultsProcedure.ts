import { canWriteTypebot } from '@/utils/api/dbRules'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { archiveResults } from '../archiveResults'

export const deleteResultsProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/typebots/{typebotId}/results',
      protect: true,
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      ids: z.string().optional(),
    })
  )
  .output(z.void())
  .mutation(async ({ input, ctx: { user } }) => {
    const idsArray = input.ids?.split(',')
    const { typebotId } = input
    const { success } = await archiveResults({
      typebotId,
      user,
      resultsFilter: {
        id: (idsArray?.length ?? 0) > 0 ? { in: idsArray } : undefined,
        typebot: canWriteTypebot(typebotId, user),
      },
    })

    if (!success)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Typebot not found',
      })
  })
