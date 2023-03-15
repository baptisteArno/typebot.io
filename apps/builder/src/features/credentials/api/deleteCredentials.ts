import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const deleteCredentials = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/credentials/:credentialsId',
      protect: true,
      summary: 'Delete credentials',
      tags: ['Credentials'],
    },
  })
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      credentialsId: z.string(),
    })
  )
  .mutation(
    async ({ input: { credentialsId, workspaceId }, ctx: { user } }) => {
      const workspace = await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          members: { some: { userId: user.id } },
        },
        select: { id: true },
      })
      if (!workspace)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })

      await prisma.credentials.delete({
        where: {
          id: credentialsId,
        },
      })
      return { credentialsId }
    }
  )
