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
  isBeingEdited: true,
  editingUserEmail: true,
  editingUserName: true,
  editingStartedAt: true,
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
        isBeingEdited: true,
        editingUserEmail: true,
        editingUserName: true,
        editingStartedAt: true,
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

    // Validação do status de edição
    if (
      typebot.isBeingEdited !== undefined ||
      typebot.editingUserEmail !== undefined
    ) {
      // Se está tentando reivindicar o editing status
      if (
        typebot.isBeingEdited === true &&
        typebot.editingUserEmail === user.email
      ) {
        // Verificar se há alguém editando há mais de 30 segundos
        if (
          existingTypebot.isBeingEdited &&
          existingTypebot.editingUserEmail !== user.email
        ) {
          const fifteenSecondsAgo = new Date(Date.now() - 15000)
          const editingStartedAt = existingTypebot.editingStartedAt

          if (editingStartedAt && editingStartedAt < fifteenSecondsAgo) {
            console.warn(
              `Auto-releasing editing status from ${existingTypebot.editingUserEmail} due to timeout`
            )
            // Continua com a claim, não bloqueia
          } else {
            throw new TRPCError({
              code: 'CONFLICT',
              message: `Typebot is currently being edited by ${existingTypebot.editingUserEmail}`,
            })
          }
        }
      }
      // Se está tentando liberar o editing status
      else if (typebot.isBeingEdited === false) {
        // Permitir se o usuário atual está editando ou se está forçando a liberação
        if (
          existingTypebot.isBeingEdited &&
          existingTypebot.editingUserEmail !== user.email
        ) {
          // Opcional: log para auditoria
          console.warn(
            `User ${user.email} is releasing editing status from ${existingTypebot.editingUserEmail}`
          )
        }
      }
    }

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
        isBeingEdited: typebot.isBeingEdited,
        editingUserEmail: typebot.editingUserEmail,
        editingUserName: typebot.editingUserName,
        editingStartedAt: typebot.editingStartedAt,
      },
    })

    const migratedTypebot = await migrateTypebot(
      typebotSchema.parse(newTypebot)
    )

    return { typebot: migratedTypebot }
  })

const isPublicIdValid = (str: string) =>
  /^([a-z0-9]+-[a-z0-9]*)*$/.test(str) || /^[a-z0-9]*$/.test(str)
