import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { ThemeTemplate, themeTemplateSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import { WorkspaceRole } from '@typebot.io/prisma'

export const deleteThemeTemplate = authenticatedProcedure
  .meta({
    openapi: {
      method: 'DELETE',
      path: '/v1/themeTemplates/{themeTemplateId}',
      protect: true,
      summary: 'Delete a theme template',
      tags: ['Theme template'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      themeTemplateId: z.string(),
    })
  )
  .output(
    z.object({
      themeTemplate: themeTemplateSchema,
    })
  )
  .mutation(
    async ({ input: { themeTemplateId, workspaceId }, ctx: { user } }) => {
      const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
          members: true,
        },
      })
      const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
      if (userRole === undefined || userRole === WorkspaceRole.GUEST)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Workspace not found',
        })

      const themeTemplate = (await prisma.themeTemplate.delete({
        where: {
          id: themeTemplateId,
        },
      })) as ThemeTemplate

      return {
        themeTemplate,
      }
    }
  )
