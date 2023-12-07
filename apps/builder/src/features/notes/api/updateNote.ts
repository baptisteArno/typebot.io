import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import prisma from '@typebot.io/lib/prisma'
import { z } from 'zod'

export const updateNote = authenticatedProcedure
  .meta({
    openapi: {
      path: '/v1/notes',
      method: 'PATCH',
      tags: ['Notes'],
      summary: 'Update note',
    },
  })
  .input(
    z.object({
      id: z.string(),
      comment: z.string().optional(),
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
  .mutation(async ({ ctx: { user }, input: { id, comment } }) => {
    const noteFound = await prisma.notes.findFirst({
      where: {
        id,
      },
    })

    if (!noteFound)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Note not found',
      })

    if (noteFound.userId !== user.id)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Forbidden: Only the owner can update the note',
      })

    const note = await prisma.notes.update({
      data: {
        comment,
      },
      where: {
        id,
      },
    })

    return { note }
  })
