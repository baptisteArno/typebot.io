import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Workspace, workspaceSchema } from '@typebot.io/schemas'
import { z } from 'zod'

export const listWorkspaces = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/workspaces',
      protect: true,
      summary: 'List workspaces',
      tags: ['Workspace'],
    },
  })
  .input(z.void())
  .output(
    z.object({
      workspaces: z.array(
        workspaceSchema.pick({ id: true, name: true, icon: true, plan: true })
      ),
    })
  )
  .query(async ({ ctx: { user } }) => {
    const workspaces = (await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      select: { name: true, id: true, icon: true, plan: true },
    })) as Pick<Workspace, 'id' | 'name' | 'icon' | 'plan'>[]

    if (!workspaces)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return { workspaces }
  })
