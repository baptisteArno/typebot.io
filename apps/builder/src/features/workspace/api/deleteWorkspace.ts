import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'

export const deleteWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/workspaces/{workspaceId}',
      protect: true,
      summary: 'Delete workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .mutation(async ({ input: { workspaceId }, ctx: { user } }) => {
    await prisma.workspace.deleteMany({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
    })

    return {
      message: 'Workspace deleted',
    }
  })
