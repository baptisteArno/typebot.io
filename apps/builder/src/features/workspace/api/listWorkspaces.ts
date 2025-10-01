import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { checkCognitoWorkspaceAccess } from '../helpers/cognitoUtils'

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
    // First, get workspaces where user is a member in the database
    const dbWorkspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: user.id } } },
      select: { name: true, id: true, icon: true, plan: true },
    })

    // Create a set of workspace IDs that user already has database access to
    const dbWorkspaceIds = new Set(dbWorkspaces.map((w) => w.id))

    // Then, check for Cognito-based workspace access
    let cognitoWorkspaces: typeof dbWorkspaces = []

    // Get workspaces that user doesn't already have database access to
    const remainingWorkspaces = await prisma.workspace.findMany({
      where: {
        id: { notIn: Array.from(dbWorkspaceIds) },
      },
      select: { name: true, id: true, icon: true, plan: true },
    })

    cognitoWorkspaces = remainingWorkspaces.filter((workspace) => {
      if (!workspace.name) return false
      const cognitoAccess = checkCognitoWorkspaceAccess(user, workspace.name)
      return cognitoAccess.hasAccess
    })

    // Combine workspaces (no need for Map since they're now guaranteed to be unique)
    const workspaces = [...dbWorkspaces, ...cognitoWorkspaces]

    if (!workspaces || workspaces.length === 0)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return { workspaces }
  })
