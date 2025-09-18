import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@typebot.io/schemas'
import { env } from '@typebot.io/env'
import { z } from 'zod'

export const listWorkspaces = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces',
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
    // Check if user is super admin
    const isSuperAdmin = env.ADMIN_EMAIL?.some((email) => email === user.email)

    const workspaces = await prisma.workspace.findMany({
      where: isSuperAdmin
        ? {} // Super admin: get ALL workspaces (no filter)
        : { members: { some: { userId: user.id } } }, // Regular user: only workspaces they're a member of
      select: { name: true, id: true, icon: true, plan: true },
    })

    if (!workspaces)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return { workspaces }
  })
