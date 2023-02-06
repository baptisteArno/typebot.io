import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'

export const getDepartmentsProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/departments',
      protect: true,
      summary: 'List departments',
      tags: ['departments'],
    },
  })
  .query(async () => {
    const departments = [
      { id: '1', name: 'Comercial' },
      { id: '2', name: 'Financeiro' },
      { id: '3', name: 'Teste' },
      { id: '4', name: 'Suporte' },
    ]

    if (!departments)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No departments found',
      })

    return departments
  })
