import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Workspace, workspaceSchema } from 'models'
import { z } from 'zod'
import { parseWorkspaceDefaultPlan } from '../../utils'

export const createWorkspaceProcedure = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/workspaces',
      protect: true,
      summary: 'Create workspace',
      tags: ['Workspace'],
    },
  })
  .input(workspaceSchema.pick({ name: true }))
  .output(
    z.object({
      workspace: workspaceSchema,
    })
  )
  .mutation(async ({ input: { name }, ctx: { user } }) => {
    const existingWorkspaceNames = (await prisma.workspace.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
      },
      select: { name: true },
    })) as Pick<Workspace, 'name'>[]

    if (existingWorkspaceNames.some((workspace) => workspace.name === name))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Workspace with same name already exists',
      })

    const plan = parseWorkspaceDefaultPlan(user.email ?? '')

    const newWorkspace = (await prisma.workspace.create({
      data: {
        name,
        members: { create: [{ role: 'ADMIN', userId: user.id }] },
        plan,
      },
    })) as Workspace

    return {
      workspace: newWorkspace,
    }
  })
