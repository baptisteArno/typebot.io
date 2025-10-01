import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'

export const rollbackTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/history/{historyId}/rollback',
      protect: true,
      summary: 'Rollback a typebot to a specific history snapshot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-typebotid)"
        ),
      historyId: z
        .string()
        .describe('ID of the history snapshot to rollback to'),
    })
  )
  .output(
    z.object({
      message: z.string(),
      historyId: z.string(),
    })
  )
  .mutation(async ({ input: { typebotId, historyId }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      select: {
        id: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        icon: true,
        folderId: true,
        groups: true,
        events: true,
        variables: true,
        edges: true,
        theme: true,
        selectedThemeTemplateId: true,
        settings: true,
        resultsTablePreferences: true,
        publicId: true,
        customDomain: true,
        workspaceId: true,
        isArchived: true,
        isClosed: true,
        riskLevel: true,
        whatsAppCredentialsId: true,
        collaborators: {
          select: {
            userId: true,
            type: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
            plan: true,
            isSuspended: true,
            isPastDue: true,
            members: {
              select: {
                userId: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Typebot not found',
      })

    const historySnapshot = await prisma.typebotHistory.findFirst({
      where: {
        id: historyId,
        typebotId,
      },
    })

    if (!historySnapshot)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'History snapshot not found',
      })

    const currentSettings =
      (historySnapshot.settings as Record<string, unknown>) || {}
    const settingsWithRestore = {
      ...currentSettings,
      _restore: {
        restoredFromId: historyId,
        restoredAt: new Date().toISOString(),
        isUnmodified: true,
      },
    }

    await prisma.typebot.update({
      where: {
        id: typebotId,
      },
      data: {
        name: historySnapshot.name,
        icon: historySnapshot.icon,
        groups: historySnapshot.groups || {},
        events: historySnapshot.events || {},
        variables: historySnapshot.variables || {},
        edges: historySnapshot.edges || {},
        theme: historySnapshot.theme || {},
        selectedThemeTemplateId: historySnapshot.selectedThemeTemplateId,
        settings: settingsWithRestore || {},
        resultsTablePreferences: historySnapshot.resultsTablePreferences
          ? historySnapshot.resultsTablePreferences
          : Prisma.JsonNull,
        publicId: historySnapshot.publicId,
        customDomain: historySnapshot.customDomain,
        isArchived: historySnapshot.isArchived,
        isClosed: historySnapshot.isClosed,
        riskLevel: historySnapshot.riskLevel,
        whatsAppCredentialsId: historySnapshot.whatsAppCredentialsId,
        updatedAt: new Date(),
      },
    })

    return {
      message: `Successfully rolled back to snapshot: ${historySnapshot.name}`,
      historyId: historyId,
    }
  })
