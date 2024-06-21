import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@sniper.io/prisma'
import {
  Sniper,
  SniperV6,
  resultsTablePreferencesSchema,
  sniperV5Schema,
  sniperV6Schema,
} from '@sniper.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import {
  sanitizeFolderId,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { preprocessSniper } from '@sniper.io/schemas/features/sniper/helpers/preprocessSniper'
import { migrateSniper } from '@sniper.io/migrations/migrateSniper'
import { trackEvents } from '@sniper.io/telemetry/trackEvents'

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

const importingSniperSchema = z.preprocess(
  preprocessSniper,
  z.discriminatedUnion('version', [
    sniperV6Schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: 'Sniper V6',
      }),
    sniperV5Schema._def.schema
      .omit(omittedProps)
      .extend({
        resultsTablePreferences: resultsTablePreferencesSchema.nullish(),
        selectedThemeTemplateId: z.string().nullish(),
      })
      .openapi({
        title: 'Sniper V5',
      }),
  ])
)

type ImportingSniper = z.infer<typeof importingSniperSchema>

const migrateImportingSniper = (sniper: ImportingSniper): Promise<SniperV6> => {
  const fullSniper = {
    ...sniper,
    id: 'dummy id',
    workspaceId: 'dummy workspace id',
    resultsTablePreferences: sniper.resultsTablePreferences ?? null,
    selectedThemeTemplateId: sniper.selectedThemeTemplateId ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    customDomain: null,
    isClosed: false,
    isArchived: false,
    whatsAppCredentialsId: null,
    publicId: null,
    riskLevel: null,
  } satisfies Sniper
  return migrateSniper(fullSniper)
}

export const importSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/snipers/import',
      protect: true,
      summary: 'Import a sniper',
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
      sniper: importingSniperSchema,
    })
  )
  .output(
    z.object({
      sniper: sniperV6Schema,
    })
  )
  .mutation(async ({ input: { sniper, workspaceId }, ctx: { user } }) => {
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

    const migratedSniper = await migrateImportingSniper(sniper)

    const groups = (
      migratedSniper.groups
        ? await sanitizeGroups(workspaceId)(migratedSniper.groups)
        : []
    ) as SniperV6['groups']

    const newSniper = await prisma.sniper.create({
      data: {
        version: '6',
        workspaceId,
        name: migratedSniper.name,
        icon: migratedSniper.icon,
        selectedThemeTemplateId: migratedSniper.selectedThemeTemplateId,
        groups,
        events: migratedSniper.events ?? undefined,
        theme: migratedSniper.theme ? migratedSniper.theme : {},
        settings: migratedSniper.settings
          ? sanitizeSettings(migratedSniper.settings, workspace.plan, 'create')
          : workspace.plan === Plan.FREE
          ? {
              general: {
                isBrandingEnabled: true,
              },
            }
          : {},
        folderId: await sanitizeFolderId({
          folderId: migratedSniper.folderId,
          workspaceId: workspace.id,
        }),
        variables: migratedSniper.variables
          ? sanitizeVariables({ variables: migratedSniper.variables, groups })
          : [],
        edges: migratedSniper.edges ?? [],
        resultsTablePreferences:
          migratedSniper.resultsTablePreferences ?? undefined,
      } satisfies Partial<SniperV6>,
    })

    const parsedNewSniper = sniperV6Schema.parse(newSniper)

    await trackEvents([
      {
        name: 'Sniper created',
        workspaceId: parsedNewSniper.workspaceId,
        sniperId: parsedNewSniper.id,
        userId: user.id,
        data: {
          name: newSniper.name,
        },
      },
    ])

    return { sniper: parsedNewSniper }
  })
