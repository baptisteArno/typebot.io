import { generateHistoryChecksum } from '@/helpers/generateHistoryChecksum'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import prisma from '@typebot.io/lib/prisma'
import { Prisma } from '@typebot.io/prisma'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'

export const updateTypebotHistory = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/history',
      protect: true,
      summary: 'Create a history snapshot for a typebot',
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
      origin: z
        .enum(['PUBLISH', 'DUPLICATION', 'MANUAL', 'IMPORT', 'RESTORE'])
        .default('MANUAL'),
      restoredFromId: z.string().optional(),
      publishedAt: z.date().optional(),
    })
  )
  .output(
    z.object({
      historyId: z.string(),
    })
  )
  .mutation(
    async ({
      input: { typebotId, origin, restoredFromId, publishedAt },
      ctx: { user },
    }) => {
      const existingTypebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
        },
        include: {
          collaborators: {
            select: {
              userId: true,
              type: true,
            },
          },
          workspace: {
            select: {
              id: true,
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

      if (!existingTypebot) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Typebot not found',
        })
      }

      if (await isWriteTypebotForbidden(existingTypebot, user))
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not allowed to modify this typebot',
        })

      const snapshotChecksum = generateHistoryChecksum(existingTypebot)

      const existingSnapshot = await prisma.typebotHistory.findUnique({
        where: {
          typebotId_snapshotChecksum: {
            typebotId: typebotId,
            snapshotChecksum,
          },
        },
        select: { id: true },
      })

      if (existingSnapshot) {
        return { historyId: existingSnapshot.id }
      }

      const newHistory = await prisma.typebotHistory.create({
        data: {
          typebotId: typebotId,
          version: existingTypebot?.version || null,
          authorId: user?.id,
          origin,
          publishedAt,
          isRestored: !!restoredFromId,
          restoredFromId,

          name: existingTypebot?.name || 'Untitled',
          icon: existingTypebot?.icon || null,
          folderId: existingTypebot?.folderId || null,
          groups: existingTypebot?.groups || {},
          events: existingTypebot?.events || {},
          variables: existingTypebot?.variables || {},
          edges: existingTypebot?.edges || {},
          theme: existingTypebot?.theme || {},
          selectedThemeTemplateId:
            existingTypebot?.selectedThemeTemplateId || null,
          settings: existingTypebot?.settings || {},
          resultsTablePreferences: existingTypebot?.resultsTablePreferences
            ? existingTypebot.resultsTablePreferences
            : Prisma.JsonNull,
          publicId: existingTypebot?.publicId || null,
          customDomain: existingTypebot?.customDomain || null,
          workspaceId: existingTypebot?.workspaceId || '',
          isArchived: existingTypebot?.isArchived || false,
          isClosed: existingTypebot?.isClosed || false,
          riskLevel: existingTypebot?.riskLevel || null,
          whatsAppCredentialsId: existingTypebot?.whatsAppCredentialsId || null,
          isSecondaryFlow: existingTypebot?.isSecondaryFlow || false,
          snapshotChecksum,
        },
      })

      return { historyId: newHistory.id }
    }
  )
