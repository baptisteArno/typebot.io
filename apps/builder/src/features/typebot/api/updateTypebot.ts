import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  sniperSchema,
  sniperV5Schema,
  sniperV6Schema,
} from '@sniper.io/schemas'
import { z } from 'zod'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeCustomDomain,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { isWriteSniperForbidden } from '../helpers/isWriteSniperForbidden'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { Prisma } from '@sniper.io/prisma'
import { migrateSniper } from '@sniper.io/migrations/migrateSniper'

const sniperUpdateSchemaPick = {
  version: true,
  name: true,
  icon: true,
  selectedThemeTemplateId: true,
  groups: true,
  theme: true,
  settings: true,
  folderId: true,
  variables: true,
  edges: true,
  resultsTablePreferences: true,
  publicId: true,
  customDomain: true,
  isClosed: true,
  whatsAppCredentialsId: true,
  riskLevel: true,
  events: true,
  updatedAt: true,
} as const

export const updateSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/snipers/{sniperId}',
      protect: true,
      summary: 'Update a sniper',
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
      sniper: z.union([
        sniperV6Schema.pick(sniperUpdateSchemaPick).partial().openapi({
          title: 'Sniper V6',
        }),
        sniperV5Schema._def.schema
          .pick(sniperUpdateSchemaPick)
          .partial()
          .openapi({
            title: 'Sniper V5',
          }),
      ]),
    })
  )
  .output(
    z.object({
      sniper: sniperV6Schema,
    })
  )
  .mutation(async ({ input: { sniperId, sniper }, ctx: { user } }) => {
    const existingSniper = await prisma.sniper.findFirst({
      where: {
        id: sniperId,
      },
      select: {
        version: true,
        id: true,
        customDomain: true,
        publicId: true,
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
        updatedAt: true,
      },
    })

    if (
      !existingSniper?.id ||
      (await isWriteSniperForbidden(existingSniper, user))
    )
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Sniper not found',
      })

    if (
      sniper.updatedAt &&
      existingSniper.updatedAt.getTime() > sniper.updatedAt.getTime()
    )
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Found newer version of the sniper in database',
      })

    if (
      sniper.customDomain &&
      existingSniper.customDomain !== sniper.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: sniper.customDomain,
        workspaceId: existingSniper.workspace.id,
      }))
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Custom domain not available',
      })

    if (sniper.publicId) {
      if (isCloudProdInstance() && sniper.publicId.length < 4)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Public id should be at least 4 characters long',
        })
      if (
        existingSniper.publicId !== sniper.publicId &&
        (await isPublicIdNotAvailable(sniper.publicId))
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Public id not available',
        })
    }

    const groups = sniper.groups
      ? await sanitizeGroups(existingSniper.workspace.id)(sniper.groups)
      : undefined

    const newSniper = await prisma.sniper.update({
      where: {
        id: existingSniper.id,
      },
      data: {
        version: sniper.version ?? undefined,
        name: sniper.name,
        icon: sniper.icon,
        selectedThemeTemplateId: sniper.selectedThemeTemplateId,
        events: sniper.events ?? undefined,
        groups,
        theme: sniper.theme ? sniper.theme : undefined,
        settings: sniper.settings
          ? sanitizeSettings(
              sniper.settings,
              existingSniper.workspace.plan,
              'update'
            )
          : undefined,
        folderId: sniper.folderId,
        variables:
          sniper.variables && groups
            ? sanitizeVariables({
                variables: sniper.variables,
                groups,
              })
            : undefined,
        edges: sniper.edges,
        resultsTablePreferences:
          sniper.resultsTablePreferences === null
            ? Prisma.DbNull
            : sniper.resultsTablePreferences,
        publicId:
          sniper.publicId === null
            ? null
            : sniper.publicId && isPublicIdValid(sniper.publicId)
            ? sniper.publicId
            : undefined,
        customDomain: await sanitizeCustomDomain({
          customDomain: sniper.customDomain,
          workspaceId: existingSniper.workspace.id,
        }),
        isClosed: sniper.isClosed,
        whatsAppCredentialsId: sniper.whatsAppCredentialsId ?? undefined,
      },
    })

    const migratedSniper = await migrateSniper(sniperSchema.parse(newSniper))

    return { sniper: migratedSniper }
  })

const isPublicIdValid = (str: string) =>
  /^([a-z0-9]+-[a-z0-9]*)*$/.test(str) || /^[a-z0-9]*$/.test(str)
