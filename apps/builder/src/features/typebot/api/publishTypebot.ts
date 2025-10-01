import { parseTypebotPublishEvents } from '@/features/telemetry/helpers/parseTypebotPublishEvents'

import { generateHistoryChecksum } from '@/helpers/generateHistoryChecksum'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { env } from '@typebot.io/env'
import prisma from '@typebot.io/lib/prisma'
import { Plan, Prisma } from '@typebot.io/prisma'
import { computeRiskLevel } from '@typebot.io/radar'
import {
  edgeSchema,
  parseGroups,
  settingsSchema,
  startEventSchema,
  themeSchema,
  variableSchema,
} from '@typebot.io/schemas'
import { InputBlockType } from '@typebot.io/schemas/features/blocks/inputs/constants'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'
import { z } from 'zod'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'

export const publishTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/{typebotId}/publish',
      protect: true,
      summary: 'Publish a typebot',
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
    })
  )
  .output(
    z.object({
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { typebotId }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
      },
      include: {
        collaborators: true,
        publishedTypebot: true,
        workspace: {
          select: {
            name: true,
            plan: true,
            isVerified: true,
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
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Typebot not found' })

    const hasFileUploadBlocks = parseGroups(existingTypebot.groups, {
      typebotVersion: existingTypebot.version,
    }).some((group) =>
      group.blocks.some((block) => block.type === InputBlockType.FILE)
    )

    if (hasFileUploadBlocks && existingTypebot.workspace.plan === Plan.FREE)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "File upload blocks can't be published on the free plan",
      })

    const typebotWasVerified =
      existingTypebot.riskLevel === -1 || existingTypebot.workspace.isVerified

    if (
      !typebotWasVerified &&
      existingTypebot.riskLevel &&
      existingTypebot.riskLevel > 80
    )
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Radar detected a potential malicious typebot. This bot is being manually reviewed by Fraud Prevention team.',
      })

    const riskLevel = typebotWasVerified
      ? 0
      : computeRiskLevel(existingTypebot, {
          debug: env.NODE_ENV === 'development',
        })

    if (riskLevel > 0 && riskLevel !== existingTypebot.riskLevel) {
      if (env.MESSAGE_WEBHOOK_URL && riskLevel !== 100 && riskLevel > 60)
        await fetch(env.MESSAGE_WEBHOOK_URL, {
          method: 'POST',
          body: `⚠️ Suspicious typebot to be reviewed: ${existingTypebot.name} (${env.NEXTAUTH_URL}/typebots/${existingTypebot.id}/edit) (workspace: ${existingTypebot.workspaceId})`,
        }).catch((err) => {
          console.error('Failed to send message', err)
        })

      await prisma.typebot.updateMany({
        where: {
          id: existingTypebot.id,
        },
        data: {
          riskLevel,
        },
      })
      if (riskLevel > 80) {
        if (existingTypebot.publishedTypebot)
          await prisma.publicTypebot.deleteMany({
            where: {
              id: existingTypebot.publishedTypebot.id,
            },
          })
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Radar detected a potential malicious typebot. This bot is being manually reviewed by Fraud Prevention team.',
        })
      }
    }

    const publishEvents = await parseTypebotPublishEvents({
      existingTypebot,
      userId: user.id,
      hasFileUploadBlocks,
    })

    if (existingTypebot.publishedTypebot)
      await prisma.publicTypebot.updateMany({
        where: {
          id: existingTypebot.publishedTypebot.id,
        },
        data: {
          version: existingTypebot.version,
          edges: z.array(edgeSchema).parse(existingTypebot.edges),
          groups: parseGroups(existingTypebot.groups, {
            typebotVersion: existingTypebot.version,
          }),
          events:
            (existingTypebot.version === '6'
              ? z.tuple([startEventSchema])
              : z.null()
            ).parse(existingTypebot.events) ?? undefined,
          settings: settingsSchema.parse(existingTypebot.settings),
          variables: z.array(variableSchema).parse(existingTypebot.variables),
          theme: themeSchema.parse(existingTypebot.theme),
        },
      })
    else
      await prisma.publicTypebot.createMany({
        data: {
          version: existingTypebot.version,
          typebotId: existingTypebot.id,
          edges: z.array(edgeSchema).parse(existingTypebot.edges),
          groups: parseGroups(existingTypebot.groups, {
            typebotVersion: existingTypebot.version,
          }),
          events:
            (existingTypebot.version === '6'
              ? z.tuple([startEventSchema])
              : z.null()
            ).parse(existingTypebot.events) ?? undefined,
          settings: settingsSchema.parse(existingTypebot.settings),
          variables: z.array(variableSchema).parse(existingTypebot.variables),
          theme: themeSchema.parse(existingTypebot.theme),
        },
      })

    const settings = (existingTypebot.settings as Record<string, unknown>) || {}
    const restoreInfo = settings._restore as
      | {
          restoredFromId?: string
          restoredAt?: string
          isUnmodified?: boolean
        }
      | undefined

    let origin: 'PUBLISH' | 'RESTORE' = 'PUBLISH'
    let isRestored = false
    let restoredFromId: string | undefined

    if (
      restoreInfo &&
      restoreInfo.isUnmodified === true &&
      restoreInfo.restoredFromId
    ) {
      origin = 'RESTORE'
      isRestored = true
      restoredFromId = restoreInfo.restoredFromId
    }

    const cleanedSettings = { ...settings }
    if (cleanedSettings._restore) {
      delete cleanedSettings._restore
      await prisma.typebot.update({
        where: { id: existingTypebot.id },
        data: {
          settings:
            Object.keys(cleanedSettings).length > 0
              ? JSON.parse(JSON.stringify(cleanedSettings))
              : {},
        },
      })
    }

    const snapshotChecksum = generateHistoryChecksum(existingTypebot)

    await prisma.typebotHistory.create({
      data: {
        typebotId: existingTypebot.id,
        version: existingTypebot.version,
        authorId: user?.id,
        origin,
        publishedAt: new Date(),
        isRestored,
        restoredFromId,
        name: existingTypebot.name,
        icon: existingTypebot.icon,
        folderId: existingTypebot.folderId,
        groups: existingTypebot.groups || {},
        events: existingTypebot.events || {},
        variables: existingTypebot.variables || {},
        edges: existingTypebot.edges || {},
        theme: existingTypebot.theme || {},
        selectedThemeTemplateId: existingTypebot.selectedThemeTemplateId,
        settings:
          Object.keys(cleanedSettings).length > 0
            ? JSON.parse(JSON.stringify(cleanedSettings))
            : {},
        resultsTablePreferences: existingTypebot.resultsTablePreferences
          ? existingTypebot.resultsTablePreferences
          : Prisma.JsonNull,
        publicId: existingTypebot.publicId,
        customDomain: existingTypebot.customDomain,
        workspaceId: existingTypebot.workspaceId,
        isArchived: existingTypebot.isArchived,
        isClosed: existingTypebot.isClosed,
        riskLevel: existingTypebot.riskLevel,
        whatsAppCredentialsId: existingTypebot.whatsAppCredentialsId,
        isSecondaryFlow: existingTypebot.isSecondaryFlow,

        snapshotChecksum,
      },
    })

    await trackEvents([
      ...publishEvents,
      {
        name: 'Typebot published',
        workspaceId: existingTypebot.workspaceId,
        typebotId: existingTypebot.id,
        userId: user.id,
        data: {
          name: existingTypebot.name,
          isFirstPublish: existingTypebot.publishedTypebot ? undefined : true,
        },
      },
    ])

    return { message: 'success' }
  })
