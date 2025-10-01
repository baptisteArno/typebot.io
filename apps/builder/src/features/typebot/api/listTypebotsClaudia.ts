import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@typebot.io/prisma'
import { Typebot, typebotV5Schema } from '@typebot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'

export const listTypebotsClaudia = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/claudia',
      protect: true,
      summary: 'List typebots for ClaudIA',
      tags: ['Typebot', 'ClaudIA'],
    },
  })
  .input(
    z.object({
      workspaceName: z.string().describe('Name of the workspace'),
      folderId: z.string().optional(),
    })
  )
  .output(
    z.object({
      typebots: z.array(
        typebotV5Schema._def.schema.pick({
          id: true,
          name: true,
          publicId: true,
        })
      ),
    })
  )
  .query(async ({ input: { workspaceName, folderId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        name: {
          equals: workspaceName,
          mode: 'insensitive',
        },
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      select: { members: true, id: true, name: true },
    })

    const userRole = getUserRoleInWorkspace(
      user.id,
      workspace?.members,
      workspace?.name,
      user
    )
    if (userRole === undefined)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    const typebots = (await prisma.typebot.findMany({
      where: {
        publicId: { not: null },
        isArchived: { not: true },
        folderId:
          userRole === WorkspaceRole.GUEST
            ? undefined
            : folderId === 'root'
            ? null
            : folderId,
        workspaceId: workspace?.id,
        collaborators:
          userRole === WorkspaceRole.GUEST
            ? { some: { userId: user.id } }
            : undefined,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        publicId: true,
      },
    })) as Pick<Typebot, 'id' | 'name' | 'publicId'>[]

    if (!typebots)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No typebots found' })

    return { typebots }
  })
