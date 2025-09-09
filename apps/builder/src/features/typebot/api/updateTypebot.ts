import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  typebotSchema,
  typebotV5Schema,
  typebotV6Schema,
} from '@typebot.io/schemas'
import { z } from 'zod'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeCustomDomain,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'
import { Prisma } from '@typebot.io/prisma'
import { migrateTypebot } from '@typebot.io/migrations/migrateTypebot'
import { checkGroupLimits, shouldUnpublishTypebot } from '@typebot.io/lib'

const typebotUpdateSchemaPick = {
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

export const updateTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/v1/typebots/{typebotId}',
      protect: true,
      summary: 'Update a typebot',
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
      typebot: z.union([
        typebotV6Schema.pick(typebotUpdateSchemaPick).partial().openapi({
          title: 'Typebot V6',
        }),
        typebotV5Schema._def.schema
          .pick(typebotUpdateSchemaPick)
          .partial()
          .openapi({
            title: 'Typebot V5',
          }),
      ]),
    })
  )
  .output(
    z.object({
      typebot: typebotV6Schema,
    })
  )
  .mutation(async ({ input: { typebotId, typebot }, ctx: { user } }) => {
    const existingTypebot = await prisma.typebot.findFirst({
      where: {
        id: typebotId,
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
      !existingTypebot?.id ||
      (await isWriteTypebotForbidden(existingTypebot, user))
    )
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Typebot not found',
      })

    if (
      typebot.updatedAt &&
      existingTypebot.updatedAt.getTime() > typebot.updatedAt.getTime()
    )
      throw new TRPCError({
        code: 'CONFLICT',
        message: 'Found newer version of the typebot in database',
      })

    if (
      typebot.customDomain &&
      existingTypebot.customDomain !== typebot.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: typebot.customDomain,
        workspaceId: existingTypebot.workspace.id,
      }))
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Custom domain not available',
      })

    if (typebot.publicId) {
      if (isCloudProdInstance() && typebot.publicId.length < 4)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Public id should be at least 4 characters long',
        })
      if (
        existingTypebot.publicId !== typebot.publicId &&
        (await isPublicIdNotAvailable(typebot.publicId))
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Public id not available',
        })
    }

    const groups = typebot.groups
      ? await sanitizeGroups(existingTypebot.workspace.id)(typebot.groups)
      : undefined

    // Check group limits if groups are being updated
    if (groups) {
      const limits = await checkGroupLimits(existingTypebot.workspace.id)
      if (groups.length > limits.maxGroups) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Maximum group limit (${limits.maxGroups}) exceeded. Cannot update typebot with ${groups.length} groups.`,
        })
      }
    }

    const newTypebot = await prisma.typebot.update({
      where: {
        id: existingTypebot.id,
      },
      data: {
        version: typebot.version ?? undefined,
        name: typebot.name,
        icon: typebot.icon,
        selectedThemeTemplateId: typebot.selectedThemeTemplateId,
        events: typebot.events ?? undefined,
        groups,
        theme: typebot.theme ? typebot.theme : undefined,
        settings: typebot.settings
          ? sanitizeSettings(
              typebot.settings,
              existingTypebot.workspace.plan,
              'update'
            )
          : undefined,
        folderId: typebot.folderId,
        variables:
          typebot.variables && groups
            ? sanitizeVariables({
                variables: typebot.variables,
                groups,
              })
            : undefined,
        edges: typebot.edges,
        resultsTablePreferences:
          typebot.resultsTablePreferences === null
            ? Prisma.DbNull
            : typebot.resultsTablePreferences,
        publicId:
          typebot.publicId === null
            ? null
            : typebot.publicId && isPublicIdValid(typebot.publicId)
            ? typebot.publicId
            : undefined,
        customDomain: await sanitizeCustomDomain({
          customDomain: typebot.customDomain,
          workspaceId: existingTypebot.workspace.id,
        }),
        isClosed: typebot.isClosed,
        whatsAppCredentialsId: typebot.whatsAppCredentialsId ?? undefined,
      },
    })

    const migratedTypebot = await migrateTypebot(
      typebotSchema.parse(newTypebot)
    )

    // Check if we need to unpublish due to group limits after update
    if (migratedTypebot.publicId && groups) {
      const shouldUnpublish = await shouldUnpublishTypebot(
        typebotId,
        groups.length
      )
      if (shouldUnpublish) {
        await prisma.typebot.update({
          where: { id: typebotId },
          data: { publicId: null },
        })
        await prisma.publicTypebot.deleteMany({
          where: { typebotId },
        })
        migratedTypebot.publicId = null
      }
    }

    return { typebot: migratedTypebot }
  })

const isPublicIdValid = (str: string) =>
  /^([a-z0-9]+-[a-z0-9]*)*$/.test(str) || /^[a-z0-9]*$/.test(str)
