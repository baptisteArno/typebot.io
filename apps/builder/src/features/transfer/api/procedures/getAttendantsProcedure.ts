import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'

export const getAttendantsProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/attendants',
      protect: true,
      summary: 'List attentants',
      tags: ['attentants'],
    },
  })
  .query(async () => {
    const attendants = [
      { id: '1', name: 'Pedro' },
      { id: '2', name: 'João' },
      { id: '3', name: 'Carlos' },
      { id: '4', name: 'Roberto' },
    ]

    if (!attendants)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No attentants found' })

    return attendants
  })
