import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { DashboardFolder, Plan, WorkspaceRole } from '@typebot.io/prisma'
import { folderSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'

export const createFolder = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/folders',
      protect: true,
      summary: 'Create a folder',
      tags: ['Folder'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      folderName: z.string().default(''),
      parentFolderId: z.string().optional(),
    })
  )
  .output(
    z.object({
      folder: folderSchema,
    })
  )
  .mutation(
    async ({
      input: { folderName, parentFolderId, workspaceId },
      ctx: { user },
    }) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, members: true, plan: true },
      })
      const userRole = getUserRoleInWorkspace(
        user.id,
        workspace?.members,
        user.email ?? undefined
      )
      if (
        userRole === undefined ||
        userRole === WorkspaceRole.GUEST ||
        !workspace
      )
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })

      if (workspace.plan === Plan.FREE)
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You need to upgrade to a paid plan to create folders',
        })

      const newFolder = await prisma.dashboardFolder.create({
        data: {
          workspaceId,
          name: folderName,
          parentFolderId,
        } satisfies Partial<DashboardFolder>,
      })

      await trackEvents([
        {
          name: 'Folder created',
          userId: user.id,
          workspaceId,
        },
      ])

      return { folder: folderSchema.parse(newFolder) }
    }
  )
