import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { forgedBlockIds } from '@typebot.io/forge-repository/constants'

export const listCredentials = authenticatedProcedure
  .input(
    z.object({
      workspaceId: z.string(),
      type: z.enum(forgedBlockIds),
    })
  )
  .query(async ({ input: { workspaceId, type }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
        members: true,
        credentials: {
          where: {
            type,
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
    })
    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    return { credentials: workspace.credentials }
  })
