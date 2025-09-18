import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import { TypebotV6, typebotV6Schema } from '@typebot.io/schemas'
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
import { EventType } from '@typebot.io/schemas/features/events/constants'
import { trackEvents } from '@typebot.io/telemetry/trackEvents'

const typebotCreateSchemaPick = {
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

export const createTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/v1/typebots',
      protect: true,
      summary: 'Create a bot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      typebot: typebotV6Schema.pick(typebotCreateSchemaPick).partial(),
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
    const userRole = getUserRoleInWorkspace(
      user.id,
      workspace?.members,
      user.email ?? undefined
    )
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

    if (
      typebot.customDomain &&
      (await isCustomDomainNotAvailable({
        customDomain: typebot.customDomain,
        workspaceId,
      }))
    )
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Custom domain not available',
      })

    if (typebot.publicId && (await isPublicIdNotAvailable(typebot.publicId)))
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Public id not available',
      })

    if (typebot.folderId) {
      const existingFolder = await prisma.dashboardFolder.findUnique({
        where: {
          id: typebot.folderId,
        },
      })
      if (!existingFolder) typebot.folderId = null
    }

    const groups = (
      typebot.groups ? await sanitizeGroups(workspaceId)(typebot.groups) : []
    ) as TypebotV6['groups']
    const newTypebot = await prisma.typebot.create({
      data: {
        version: '6',
        workspaceId,
        name: typebot.name ?? 'My typebot',
        icon: typebot.icon,
        selectedThemeTemplateId: typebot.selectedThemeTemplateId,
        groups,
        events: typebot.events ?? [
          {
            type: EventType.START,
            graphCoordinates: { x: 0, y: 0 },
            id: createId(),
          },
        ],
        theme: typebot.theme ? typebot.theme : {},
        settings: typebot.settings
          ? sanitizeSettings(typebot.settings, workspace.plan, 'create')
          : workspace.plan === Plan.FREE
          ? {
              general: { isBrandingEnabled: true },
            }
          : {},
        folderId: typebot.folderId,
        variables: typebot.variables
          ? sanitizeVariables({ variables: typebot.variables, groups })
          : [],
        edges: typebot.edges ?? [],
        resultsTablePreferences: typebot.resultsTablePreferences ?? undefined,
        publicId: typebot.publicId ?? undefined,
        customDomain: typebot.customDomain ?? undefined,
      } satisfies Partial<TypebotV6>,
    })

    const parsedNewTypebot = typebotV6Schema.parse(newTypebot)

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
