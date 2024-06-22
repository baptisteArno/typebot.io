import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { WorkspaceRole } from '@sniper.io/prisma'
import { PublicSniper, Sniper, sniperV5Schema } from '@sniper.io/schemas'
import { omit } from '@sniper.io/lib'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'

export const listSnipers = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/snipers',
      protect: true,
      summary: 'List snipers',
      tags: ['Sniper'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          '[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)'
        ),
      folderId: z.string().optional(),
    })
  )
  .output(
    z.object({
      snipers: z.array(
        sniperV5Schema._def.schema
          .pick({
            name: true,
            icon: true,
            id: true,
          })
          .merge(z.object({ publishedSniperId: z.string().optional() }))
      ),
    })
  )
  .query(async ({ input: { workspaceId, folderId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { members: true },
    })
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
    if (userRole === undefined)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })
    const snipers = (await prisma.sniper.findMany({
      where: {
        isArchived: { not: true },
        folderId:
          userRole === WorkspaceRole.GUEST
            ? undefined
            : folderId === 'root'
            ? null
            : folderId,
        workspaceId,
        collaborators:
          userRole === WorkspaceRole.GUEST
            ? { some: { userId: user.id } }
            : undefined,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        publishedSniper: { select: { id: true } },
        id: true,
        icon: true,
      },
    })) as (Pick<Sniper, 'name' | 'id' | 'icon'> & {
      publishedSniper: Pick<PublicSniper, 'id'>
    })[]

    if (!snipers)
      throw new TRPCError({ code: 'NOT_FOUND', message: 'No snipers found' })

    return {
      snipers: snipers.map((sniper) => ({
        publishedSniperId: sniper.publishedSniper?.id,
        ...omit(sniper, 'publishedSniper'),
      })),
    }
  })
