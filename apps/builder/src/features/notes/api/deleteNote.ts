import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import prisma from '@typebot.io/lib/prisma'
import { z } from 'zod'

export const deleteNote = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/notes',
      protect: true,
      summary: 'Delete note',
      tags: ['Notes'],
    },
  })
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ ctx: { user }, input: { id } }) => {
    const note = await prisma.notes.findFirst({
      where: {
        id,
      },
    })

    if (!note)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Note not found',
      })

    if (note.userId !== user.id)
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Forbidden: Only the owner can delete the note',
      })

    await prisma.notes.delete({
      where: {
        id,
      },
    })
  })
