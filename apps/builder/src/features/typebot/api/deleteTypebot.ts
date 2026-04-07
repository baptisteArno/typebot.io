import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'

export const deleteTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/typebots/{typebotId}',
      protect: true,
      summary: 'Delete a typebot',
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
        workspace: {
          select: {
            id: true,
            name: true,
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

    await prisma.$transaction([
      prisma.$executeRaw`
        DELETE FROM "ChatSession"
        WHERE id IN (
          SELECT "lastChatSessionId" FROM "Result"
          WHERE "typebotId" = ${typebotId}
          AND "lastChatSessionId" IS NOT NULL
        )
      `,
      prisma.typebotEditQueue.deleteMany({ where: { typebotId } }),
      prisma.bannedIp.deleteMany({
        where: { responsibleTypebotId: typebotId },
      }),
      prisma.typebot.delete({ where: { id: typebotId } }),
    ])

    return {
      message: 'success',
    }
  })
