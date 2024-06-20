import prisma from '@sniper.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@sniper.io/prisma'
import { SniperV6, sniperV6Schema } from '@sniper.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeGroups,
  sanitizeSettings,
  sanitizeVariables,
} from '../helpers/sanitizers'
import { createId } from '@paralleldrive/cuid2'
import { EventType } from '@sniper.io/schemas/features/events/constants'
import { trackEvents } from '@sniper.io/telemetry/trackEvents'

const sniperCreateSchemaPick = {
  name: true,
  icon: true,
  selectedThemeTemplateId: true,
  groups: true,
  events: true,
  theme: true,
  settings: true,
  folderId: true,
  variables: true,
  edges: true,
  resultsTablePreferences: true,
  publicId: true,
  customDomain: true,
} as const

export const createSniper = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/snipers',
      protect: true,
      summary: 'Create a sniper',
      tags: ['Sniper'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      sniper: sniperV6Schema.pick(sniperCreateSchemaPick).partial(),
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

    if (
      sniper.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: sniper.customDomain,
        workspaceId,
      }))
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Custom domain not available',
      })

    if (sniper.publicId && (await isPublicIdNotAvailable(sniper.publicId)))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Public id not available',
      })

    if (sniper.folderId) {
      const existingFolder = await prisma.dashboardFolder.findUnique({
        where: {
          id: sniper.folderId,
        },
      })
      if (!existingFolder) sniper.folderId = null
    }

    const groups = (
      sniper.groups ? await sanitizeGroups(workspaceId)(sniper.groups) : []
    ) as SniperV6['groups']
    const newSniper = await prisma.sniper.create({
      data: {
        version: '6',
        workspaceId,
        name: sniper.name ?? 'My sniper',
        icon: sniper.icon,
        selectedThemeTemplateId: sniper.selectedThemeTemplateId,
        groups,
        events: sniper.events ?? [
          {
            type: EventType.START,
            graphCoordinates: { x: 0, y: 0 },
            id: createId(),
          },
        ],
        theme: sniper.theme ? sniper.theme : {},
        settings: sniper.settings
          ? sanitizeSettings(sniper.settings, workspace.plan, 'create')
          : workspace.plan === Plan.FREE
          ? {
              general: { isBrandingEnabled: true },
            }
          : {},
        folderId: sniper.folderId,
        variables: sniper.variables
          ? sanitizeVariables({ variables: sniper.variables, groups })
          : [],
        edges: sniper.edges ?? [],
        resultsTablePreferences: sniper.resultsTablePreferences ?? undefined,
        publicId: sniper.publicId ?? undefined,
        customDomain: sniper.customDomain ?? undefined,
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
