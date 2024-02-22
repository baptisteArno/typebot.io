import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceInvitationSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '../helpers/isReadWorkspaceFobidden'

export const listInvitationsInWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces/{workspaceId}/invitations',
      protect: true,
      summary: 'List invitations in workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          '[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)'
        ),
    })
  )
  .output(
    z.object({
      invitations: z.array(workspaceInvitationSchema),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true, invitations: true },
    })

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return { invitations: workspace.invitations }
  })
