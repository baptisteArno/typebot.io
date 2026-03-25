import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { Prisma } from '@typebot.io/prisma'
import {
  getCognitoAccessibleWorkspaceIds,
  type CognitoAccess,
} from '../helpers/cognitoUtils'

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
    const cognitoAccess = getCognitoAccessibleWorkspaceIds(user)
    const workspaces = await findWorkspaces(user.id, cognitoAccess)

    if (workspaces.length === 0)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return { workspaces }
  })

const findWorkspaces = (userId: string, cognitoAccess: CognitoAccess) => {
  const workspaceFilter = getWorkspaceFilter(userId, cognitoAccess)
  return prisma.workspace.findMany({
    where: workspaceFilter,
    select: {
      id: true,
      name: true,
      icon: true,
      plan: true,
    },
  })
}

const getWorkspaceFilter = (
  userId: string,
  cognitoAccess: CognitoAccess
): Prisma.WorkspaceWhereInput => {
  switch (cognitoAccess.type) {
    case 'admin':
      return {
        NOT: { name: { contains: "'s workspace" } },
      }
    case 'restricted':
      return {
        OR: [
          {
            members: { some: { userId } },
          },
          { id: { in: cognitoAccess.ids } },
        ],
      }
    case 'none':
      return {
        members: { some: { userId } },
      }
  }
}
