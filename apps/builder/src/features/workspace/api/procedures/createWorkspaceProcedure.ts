import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/utils/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan } from 'db'
import { Workspace, workspaceSchema } from 'models'
import { z } from 'zod'

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

    const plan =
      process.env.ADMIN_EMAIL === user.email ? Plan.LIFETIME : Plan.FREE

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
