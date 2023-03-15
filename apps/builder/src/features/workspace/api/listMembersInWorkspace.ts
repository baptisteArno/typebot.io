import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceMember, workspaceMemberSchema } from '@typebot.io/schemas'
import { z } from 'zod'

export const listMembersInWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/workspaces/{workspaceId}/members',
      protect: true,
      summary: 'List members in workspace',
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
      members: z.array(workspaceMemberSchema),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const members = (await prisma.memberInWorkspace.findMany({
      where: { userId: user.id, workspaceId },
      include: { user: { select: { name: true, email: true, image: true } } },
    })) as WorkspaceMember[]

    if (!members)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No members found' })

    return { members }
  })
