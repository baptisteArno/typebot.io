import { authenticatedProcedure } from '@/helpers/server/trpc'
import prisma from '@typebot.io/lib/prisma'
import { z } from 'zod'

export const getNotes = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/notes',
      protect: true,
      summary: 'List notes',
      tags: ['Notes'],
    },
  })
  .input(
    z.object({
      groupId: z.string(),
    })
  )
  .output(
    z.object({
      notes: z.array(
        z.object({
          id: z.string(),
          groupId: z.string(),
          userId: z.string(),
          avatarUrl: z.string().optional(),
          name: z.string(),
          comment: z.string(),
          createdAt: z.date(),
        })
      ),
    })
  )
  .query(async ({ input: { groupId } }) => {
    const notesDb = await prisma.notes.findMany({
      where: {
        groupId,
      },
      include: {
        user: true,
      },
    })

    const notes = notesDb
      .map((data) => ({
        id: data.id,
        groupId: data.groupId,
        userId: data.userId,
        avatarUrl: data.user.image!,
        name: data.user.name!,
        comment: data.comment,
        createdAt: data.createdAt,
      }))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

    return { notes }
  })
