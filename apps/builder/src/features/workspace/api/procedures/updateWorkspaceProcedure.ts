import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Workspace, workspaceSchema } from 'models'
import { z } from 'zod'

export const updateWorkspaceProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/workspaces/{workspaceId}',
      protect: true,
      summary: 'Update workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      name: z.string().optional(),
      icon: z.string().optional(),
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      workspace: workspaceSchema,
    })
  )
  .mutation(async ({ input: { workspaceId, ...updates }, ctx: { user } }) => {
    await prisma.workspace.updateMany({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
      data: updates,
    })

    const workspace = (await prisma.workspace.findFirst({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
    })) satisfies Workspace | null

    if (!workspace)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    return {
      workspace,
    }
  })
