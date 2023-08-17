import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { isAdminWriteWorkspaceForbidden } from '../helpers/isAdminWriteWorkspaceForbidden'
import { TRPCError } from '@trpc/server'

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
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true },
    })

    if (!workspace || isAdminWriteWorkspaceForbidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    await prisma.workspace.deleteMany({
      where: { members: { some: { userId: user.id } }, id: workspaceId },
    })

    return {
      message: 'Workspace deleted',
    }
  })
