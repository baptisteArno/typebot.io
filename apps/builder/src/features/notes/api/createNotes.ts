import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import prisma from '@typebot.io/lib/prisma'
import { z } from 'zod'

export const createNotes = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/notes',
      protect: true,
      summary: 'Create notes',
      tags: ['Notes'],
    },
  })
  .input(
    z.object({
      groupId: z.string(),
      userId: z.string(),
      comment: z.string(),
    })
  )
  .output(
    z.object({
      note: z.object({
        id: z.string(),
        groupId: z.string(),
        userId: z.string(),
        comment: z.string(),
      }),
    })
  )
  .mutation(async ({ input: { comment, groupId, userId }, ctx: { user } }) => {
    if (userId !== user.id) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Forbidden: Only the logged-in user can post comments.',
      })
    }

    const note = await prisma.notes.create({
      data: {
        groupId,
        userId,
        comment,
      },
    })

    return { note }
  })
