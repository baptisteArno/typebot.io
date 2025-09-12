import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'

export const clearEditingStatus = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/clear-editing-status',
      protect: true,
      summary: 'Clear editing status of a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)"
        ),
      force: z
        .boolean()
        .optional()
        .default(false)
        .describe('Force clear even if current user is not the one editing'),
    })
  )
  .output(
    z.object({
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { typebotId, force }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        isBeingEdited: true,
        editingUserEmail: true,
        editingUserName: true,
        editingStartedAt: true,
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
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

    if (
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    // Se não está sendo editado, não há nada para limpar
    if (!existingTypebot.isBeingEdited) {
      return { message: 'success' as const }
    }

    // Verifica se o usuário atual é o que está editando ou se está forçando
    if (!force && existingTypebot.editingUserEmail !== user.email) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Cannot clear editing status. Typebot is being edited by ${existingTypebot.editingUserEmail}`,
      })
    }

    await prisma.typebot.update({
      where: {
        id: typebotId,
      },
      data: {
        isBeingEdited: false,
        editingUserEmail: null,
        editingUserName: null,
      },
    })

    return { message: 'success' as const }
  })
