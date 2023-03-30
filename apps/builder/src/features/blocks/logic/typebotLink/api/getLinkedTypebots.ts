import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Typebot, typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'

export const getLinkedTypebots = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/linkedTypebots',
      protect: true,
      summary: 'Get linked typebots',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      typebotIds: z.string().describe('Comma separated list of typebot ids'),
    })
  )
  .output(
    z.object({
      typebots: z.array(
        typebotSchema.pick({
          id: true,
          groups: true,
          variables: true,
          name: true,
        })
      ),
    })
  )
  .query(async ({ input: { workspaceId, typebotIds }, ctx: { user } }) => {
    const typebotIdsArray = typebotIds.split(',')
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { members: true },
    })
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
    if (userRole === undefined)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })
    const typebots = (await prisma.typebot.findMany({
      where: {
        isArchived: { not: true },
        id: { in: typebotIdsArray },
        workspaceId,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        groups: true,
        variables: true,
        name: true,
      },
    })) as Pick<Typebot, 'id' | 'groups' | 'variables' | 'name'>[]

    if (!typebots)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No typebots found' })

    return {
      typebots,
    }
  })
