import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  WorkspaceInvitation,
  workspaceInvitationSchema,
} from '@typebot.io/schemas'
import { z } from 'zod'

export const listInvitationsInWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/workspaces/{workspaceId}/invitations',
      protect: true,
      summary: 'List invitations in workspace',
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
      invitations: z.array(workspaceInvitationSchema),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const invitations = (await prisma.workspaceInvitation.findMany({
      where: {
        workspaceId,
        workspace: { members: { some: { userId: user.id } } },
      },
      select: { createdAt: true, email: true, type: true },
    })) as WorkspaceInvitation[]

    if (!invitations)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'No invitations found',
      })

    return { invitations }
  })
