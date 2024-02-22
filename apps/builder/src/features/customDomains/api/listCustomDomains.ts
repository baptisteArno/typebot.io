import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { customDomainSchema } from '@typebot.io/schemas/features/customDomains'

export const listCustomDomains = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/custom-domains',
      protect: true,
      summary: 'List custom domains',
      tags: ['Custom domains'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      customDomains: z.array(
        customDomainSchema.pick({
          name: true,
          createdAt: true,
        })
      ),
    })
  )
  .query(async ({ input: { workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId },
      select: {
        members: {
          select: {
            userId: true,
          },
        },
        customDomains: true,
      },
    })

    if (!workspace || isReadWorkspaceFobidden(workspace, user))
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No workspaces found' })

    const descSortedCustomDomains = workspace.customDomains.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    return { customDomains: descSortedCustomDomains }
  })
