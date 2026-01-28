import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import {
  emailIsCloudhumans,
  CLOUDHUMANS_EMAIL_DOMAIN,
} from '@typebot.io/lib/utils'
import { WorkspaceRole } from '@typebot.io/prisma'
import { isAdminWriteWorkspaceForbidden } from '@/features/workspace/helpers/isAdminWriteWorkspaceForbidden'

export const inviteCloudersClaudia = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/workspaces/{workspaceId}/invite-clouders',
      protect: true,
      summary: 'Invite all cloudhumans.com users as ADMINs to a workspace',
      tags: ['Workspace', 'ClaudIA'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string().describe('ID of the workspace'),
    })
  )
  .output(
    z.object({
      addedCount: z.number(),
      alreadyMemberCount: z.number(),
      addedUsers: z.array(
        z.object({
          id: z.string(),
          email: z.string().nullable(),
          name: z.string().nullable(),
        })
      ),
    })
  )
  .mutation(async ({ input: { workspaceId }, ctx: { user } }) => {
    if (!emailIsCloudhumans(user.email)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Unauthorized',
      })
    }

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: {
        id: true,
        name: true,
        members: { select: { userId: true, role: true } },
      },
    })

    if (!workspace) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Workspace not found',
      })
    }

    if (isAdminWriteWorkspaceForbidden(workspace, user)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'You are not an ADMIN of this workspace',
      })
    }

    const cloudhumansUsers = await prisma.user.findMany({
      where: {
        email: {
          endsWith: CLOUDHUMANS_EMAIL_DOMAIN,
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    const existingMembers = await prisma.memberInWorkspace.findMany({
      where: { workspaceId },
      select: { userId: true },
    })

    const existingMemberIds = new Set(existingMembers.map((m) => m.userId))

    const usersToAdd = cloudhumansUsers.filter(
      (u) => !existingMemberIds.has(u.id)
    )

    if (usersToAdd.length > 0) {
      await prisma.memberInWorkspace.createMany({
        data: usersToAdd.map((u) => ({
          userId: u.id,
          workspaceId,
          role: WorkspaceRole.ADMIN,
        })),
        skipDuplicates: true,
      })
    }

    return {
      addedCount: usersToAdd.length,
      alreadyMemberCount: cloudhumansUsers.length - usersToAdd.length,
      addedUsers: usersToAdd,
    }
  })
