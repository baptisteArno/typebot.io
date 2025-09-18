import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceMemberSchema } from '@typebot.io/schemas'
import { WorkspaceRole } from '@typebot.io/prisma'
import { env } from '@typebot.io/env'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '../helpers/isReadWorkspaceFobidden'

export const listMembersInWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces/{workspaceId}/members',
      protect: true,
      summary: 'List members in workspace',
      tags: ['Workspace'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          '[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)'
        ),
    })
  )
  .output(
    z.object({
      members: z.array(workspaceMemberSchema),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    })

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    const members = workspace.members.map((member) => ({
      role: member.role,
      user: member.user,
      workspaceId,
    }))

    // Check if current user is super admin (can access any workspace)
    const isSuperAdmin = env.ADMIN_EMAIL?.some((email) => email === user.email)
    const isAlreadyMember = workspace.members.some(
      (member) => member.userId === user.id
    )

    if (isSuperAdmin && !isAlreadyMember) {
      // Super admin accessing workspace they're not a member of: add as virtual ADMIN member
      members.push({
        role: WorkspaceRole.ADMIN,
        user,
        workspaceId,
      })
    }

    return {
      members,
    }
  })
