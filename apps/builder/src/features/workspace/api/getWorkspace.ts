import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { workspaceSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '../helpers/isReadWorkspaceFobidden'

export const getWorkspace = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/workspaces/{workspaceId}',
      protect: true,
      summary: 'Get workspace',
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
      workspace: workspaceSchema.omit({
        chatsLimitFirstEmailSentAt: true,
        chatsLimitSecondEmailSentAt: true,
        storageLimitFirstEmailSentAt: true,
        storageLimitSecondEmailSentAt: true,
        customStorageLimit: true,
        additionalChatsIndex: true,
        additionalStorageIndex: true,
        isQuarantined: true,
      }),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      include: { members: true },
    })

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    return {
      workspace,
    }
  })
