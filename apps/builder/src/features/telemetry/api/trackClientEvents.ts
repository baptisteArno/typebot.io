import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import prisma from '@sniper.io/lib/prisma'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import { WorkspaceRole } from '@sniper.io/prisma'
import { isWriteSniperForbidden } from '@/features/sniper/helpers/isWriteSniperForbidden'
import { trackEvents } from '@sniper.io/telemetry/trackEvents'
import { clientSideCreateEventSchema } from '@sniper.io/schemas'

export const trackClientEvents = authenticatedProcedure
  .input(
    z.object({
      events: z.array(clientSideCreateEventSchema),
    })
  )
  .output(
    z.object({
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { events }, ctx: { user } }) => {
    const workspaces = await prisma.workspace.findMany({
      where: {
        id: {
          in: events
            .filter((event) => 'workspaceId' in event)
            .map((event) => (event as { workspaceId: string }).workspaceId),
        },
      },
      select: {
        id: true,
        members: true,
      },
    })
    const snipers = await prisma.sniper.findMany({
      where: {
        id: {
          in: events
            .filter((event) => 'sniperId' in event)
            .map((event) => (event as { sniperId: string }).sniperId),
        },
      },
      select: {
        id: true,
        workspaceId: true,
        workspace: {
          select: {
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                role: true,
                userId: true,
              },
            },
          },
        },
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
      },
    })
    for (const event of events) {
      if ('workspaceId' in event) {
        const workspace = workspaces.find((w) => w.id === event.workspaceId)
        const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
        if (
          userRole === undefined ||
          userRole === WorkspaceRole.GUEST ||
          !workspace
        )
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Workspace not found',
          })
      }

      if ('sniperId' in event) {
        const sniper = snipers.find((t) => t.id === event.sniperId)
        if (!sniper || (await isWriteSniperForbidden(sniper, user)))
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Sniper not found',
          })
      }
    }

    await trackEvents(events.map((e) => ({ ...e, userId: user.id })))

    return { message: 'success' }
  })
