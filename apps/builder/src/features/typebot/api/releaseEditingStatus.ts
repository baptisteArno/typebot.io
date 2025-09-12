import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import prisma from '@typebot.io/lib/prisma'

export const releaseEditingStatus = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/release-editing',
      protect: true,
      summary: 'Release editing status',
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
      success: z.boolean(),
    })
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
    const typebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
        editingUserEmail: user.email, // Só pode limpar se for o próprio usuário
      },
      select: { id: true },
    })

    if (!typebot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Typebot not found or not being edited by this user',
      })

    try {
      await prisma.typebot.update({
        where: { id: typebotId },
        data: {
          isBeingEdited: false,
          editingUserEmail: null,
          editingUserName: null,
          editingStartedAt: null,
        },
      })

      return { success: true }
    } catch (error) {
      console.error('❌ API: Failed to release editing status:', error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to release editing status',
      })
    }
  })
