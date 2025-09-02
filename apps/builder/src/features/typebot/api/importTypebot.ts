import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import {
  Typebot,
  TypebotV6,
  resultsTablePreferencesSchema,
  typebotV5Schema,
  typebotV6Schema,
} from '@typebot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import {
  sanitizeFolderId,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { preprocessTypebot } from '@typebot.io/schemas/features/typebot/helpers/preprocessTypebot'
import { migrateTypebot } from '@typebot.io/migrations/migrateTypebot'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'
import { checkGroupLimits } from '@typebot.io/lib'

const omittedProps = {
  id: true,
  whatsAppCredentialsId: true,
  riskLevel: true,
  isClosed: true,
  isArchived: true,
  createdAt: true,
  updatedAt: true,
  customDomain: true,
  workspaceId: true,
  resultsTablePreferencesSchema: true,
  selectedThemeTemplateId: true,
  publicId: true,
} as const

const importingTypebotSchema = z.preprocess(
  preprocessTypebot,
  z.discriminatedUnion('version', [
    typebotV6Schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: 'Typebot V6',
      }),
    typebotV5Schema._def.schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: 'Typebot V5',
      }),
  ])
)

type ImportingTypebot = z.infer<typeof importingTypebotSchema>

const migrateImportingTypebot = (
  typebot: ImportingTypebot
): Promise<TypebotV6> => {
  const fullTypebot = {
    ...typebot,
    id: 'dummy id',
    workspaceId: 'dummy workspace id',
    resultsTablePreferences: typebot.resultsTablePreferences ?? null,
    selectedThemeTemplateId: typebot.selectedThemeTemplateId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customDomain: null,
    isClosed: false,
    isArchived: false,
    whatsAppCredentialsId: null,
    publicId: null,
    riskLevel: null,
  } satisfies Typebot
  return migrateTypebot(fullTypebot)
}

export const importTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots/import',
      protect: true,
      summary: 'Import a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      workspaceId: z
        .string()
        .describe(
          '[Where to find my workspace ID?](../how-to#how-to-find-my-workspaceid)'
        ),
      typebot: importingTypebotSchema,
    })
  )
  .output(
    z.object({
      typebot: typebotV6Schema,
    })
  )
  .mutation(async ({ input: { typebot, workspaceId }, ctx: { user } }) => {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, members: true, plan: true },
    })
    const userRole = getUserRoleInWorkspace(user.id, workspace?.members)
    if (
      userRole === undefined ||
      userRole === WorkspaceRole.GUEST ||
      !workspace
    )
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Workspace not found' })

    // Check if workspace already has 5 typebots
    const existingTypebotCount = await prisma.typebot.count({
      where: {
        workspaceId,
        isArchived: { not: true },
      },
    })

    if (existingTypebotCount >= 5) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Maximum limit of 5 typebots reached for this workspace',
      })
    }

    const migratedTypebot = await migrateImportingTypebot(typebot)

    const groups = (
      migratedTypebot.groups
        ? await sanitizeGroups(workspaceId)(migratedTypebot.groups)
        : []
    ) as TypebotV6['groups']

    // Check group limits for the imported typebot
    if (groups.length > 0) {
      // Create a temporary typebot to check limits
      const tempTypebotId = `temp-${Date.now()}`
      const limits = await checkGroupLimits(tempTypebotId)

      if (limits.maxGroups > 0 && groups.length > limits.maxGroups) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: `Imported typebot has ${groups.length} groups, but the maximum allowed is ${limits.maxGroups}. Please reduce the number of groups before importing.`,
        })
      }
    }

    const newTypebot = await prisma.typebot.create({
      data: {
        version: '6',
        workspaceId,
        name: migratedTypebot.name,
        icon: migratedTypebot.icon,
        selectedThemeTemplateId: migratedTypebot.selectedThemeTemplateId,
        groups,
        events: migratedTypebot.events ?? undefined,
        theme: migratedTypebot.theme ? migratedTypebot.theme : {},
        settings: migratedTypebot.settings
          ? sanitizeSettings(migratedTypebot.settings, workspace.plan, 'create')
          : workspace.plan === Plan.FREE
          ? {
              general: {
                isBrandingEnabled: true,
              },
            }
          : {},
        folderId: await sanitizeFolderId({
          folderId: migratedTypebot.folderId,
          workspaceId: workspace.id,
        }),
        variables: migratedTypebot.variables
          ? sanitizeVariables({ variables: migratedTypebot.variables, groups })
          : [],
        edges: migratedTypebot.edges ?? [],
        resultsTablePreferences:
          migratedTypebot.resultsTablePreferences ?? undefined,
      } satisfies Partial<TypebotV6>,
    })

    const parsedNewTypebot = typebotV6Schema.parse(newTypebot)

    // Check if the imported typebot should be automatically unpublished due to group limits
    if (groups.length > 0) {
      const limits = await checkGroupLimits(parsedNewTypebot.id)

      if (limits.maxGroups > 0 && groups.length > limits.maxGroups) {
        // Update the typebot to remove publicId (unpublish it)
        await prisma.typebot.update({
          where: { id: parsedNewTypebot.id },
          data: { publicId: null },
        })

        // Also remove from publicTypebot table if it exists
        await prisma.publicTypebot.deleteMany({
          where: { typebotId: parsedNewTypebot.id },
        })

        // Update the parsed typebot to reflect the unpublished state
        parsedNewTypebot.publicId = null
      }
    }

    await trackEvents([
      {
        name: 'Typebot created',
        workspaceId: parsedNewTypebot.workspaceId,
        typebotId: parsedNewTypebot.id,
        userId: user.id,
        data: {
          name: newTypebot.name,
        },
      },
    ])

    return { typebot: parsedNewTypebot }
  })
