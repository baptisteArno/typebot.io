import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  edgeSchema,
  settingsSchema,
  themeSchema,
  variableSchema,
  parseGroups,
  startEventSchema,
} from '@sniper.io/schemas'
import { z } from 'zod'
import { isWriteSniperForbidden } from '../helpers/isWriteSniperForbidden'
import { Plan } from '@sniper.io/prisma'
import { InputBlockType } from '@sniper.io/schemas/features/blocks/inputs/constants'
import { computeRiskLevel } from '@sniper.io/radar'
import { env } from '@sniper.io/env'
import { trackEvents } from '@sniper.io/telemetry/trackEvents'
import { parseSniperPublishEvents } from '@/features/telemetry/helpers/parseSniperPublishEvents'

export const publishSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/snipers/{sniperId}/publish',
      protect: true,
      summary: 'Publish a sniper',
      tags: ['Sniper'],
    },
  })
  .input(
    z.object({
      sniperId: z
        .string()
        .describe(
          "[Where to find my bot's ID?](../how-to#how-to-find-my-sniperid)"
        ),
    })
  )
  .output(
    z.object({
      message: z.literal('success'),
    })
  )
  .mutation(async ({ input: { sniperId }, ctx: { user } }) => {
    const existingSniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
      },
      include: {
        collaborators: true,
        publishedSniper: true,
        workspace: {
          select: {
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
      !existingSniper?.id ||
      (await isWriteSniperForbidden(existingSniper, user))
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Sniper not found' })

    const hasFileUploadBlocks = parseGroups(existingSniper.groups, {
      sniperVersion: existingSniper.version,
    }).some((group) =>
      group.blocks.some((block) => block.type === InputBlockType.FILE)
    )

    if (hasFileUploadBlocks && existingSniper.workspace.plan === Plan.FREE)
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "File upload blocks can't be published on the free plan",
      })

    const sniperWasVerified =
      existingSniper.riskLevel === -1 || existingSniper.workspace.isVerified

    if (
      !sniperWasVerified &&
      existingSniper.riskLevel &&
      existingSniper.riskLevel > 80
    )
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Radar detected a potential malicious sniper. This bot is being manually reviewed by Fraud Prevention team.',
      })

    const riskLevel = sniperWasVerified
      ? 0
      : computeRiskLevel(existingSniper, {
          debug: env.NODE_ENV === 'development',
        })

    if (riskLevel > 0 && riskLevel !== existingSniper.riskLevel) {
      if (env.MESSAGE_WEBHOOK_URL && riskLevel !== 100 && riskLevel > 60)
        await fetch(env.MESSAGE_WEBHOOK_URL, {
          method: 'POST',
          body: `⚠️ Suspicious sniper to be reviewed: ${existingSniper.name} (${env.NEXTAUTH_URL}/snipers/${existingSniper.id}/edit) (workspace: ${existingSniper.workspaceId})`,
        }).catch((err) => {
          console.error('Failed to send message', err)
        })

      await prisma.sniper.updateMany({
        where: {
          id: existingSniper.id,
        },
        data: {
          riskLevel,
        },
      })
      if (riskLevel > 80) {
        if (existingSniper.publishedSniper)
          await prisma.publicSniper.deleteMany({
            where: {
              id: existingSniper.publishedSniper.id,
            },
          })
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Radar detected a potential malicious sniper. This bot is being manually reviewed by Fraud Prevention team.',
        })
      }
    }

    const publishEvents = await parseSniperPublishEvents({
      existingSniper,
      userId: user.id,
      hasFileUploadBlocks,
    })

    if (existingSniper.publishedSniper)
      await prisma.publicSniper.updateMany({
        where: {
          id: existingSniper.publishedSniper.id,
        },
        data: {
          version: existingSniper.version,
          edges: z.array(edgeSchema).parse(existingSniper.edges),
          groups: parseGroups(existingSniper.groups, {
            sniperVersion: existingSniper.version,
          }),
          events:
            (existingSniper.version === '6'
              ? z.tuple([startEventSchema])
              : z.null()
            ).parse(existingSniper.events) ?? undefined,
          settings: settingsSchema.parse(existingSniper.settings),
          variables: z.array(variableSchema).parse(existingSniper.variables),
          theme: themeSchema.parse(existingSniper.theme),
        },
      })
    else
      await prisma.publicSniper.createMany({
        data: {
          version: existingSniper.version,
          sniperId: existingSniper.id,
          edges: z.array(edgeSchema).parse(existingSniper.edges),
          groups: parseGroups(existingSniper.groups, {
            sniperVersion: existingSniper.version,
          }),
          events:
            (existingSniper.version === '6'
              ? z.tuple([startEventSchema])
              : z.null()
            ).parse(existingSniper.events) ?? undefined,
          settings: settingsSchema.parse(existingSniper.settings),
          variables: z.array(variableSchema).parse(existingSniper.variables),
          theme: themeSchema.parse(existingSniper.theme),
        },
      })

    await trackEvents([
      ...publishEvents,
      {
        name: 'Sniper published',
        workspaceId: existingSniper.workspaceId,
        sniperId: existingSniper.id,
        userId: user.id,
        data: {
          name: existingSniper.name,
          isFirstPublish: existingSniper.publishedSniper ? undefined : true,
        },
      },
    ])

    return { message: 'success' }
  })
