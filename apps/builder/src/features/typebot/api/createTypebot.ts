import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { Plan, WorkspaceRole } from '@typebot.io/prisma'
import {
  defaultSettings,
  defaultTheme,
  typebotCreateSchema,
  typebotSchema,
} from '@typebot.io/schemas'
import { z } from 'zod'
import { getUserRoleInWorkspace } from '@/features/workspace/helpers/getUserRoleInWorkspace'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeGroups,
  sanitizeSettings,
} from '../helpers/sanitizers'
import { createId } from '@paralleldrive/cuid2'
import { sendTelemetryEvents } from '@typebot.io/lib/telemetry/sendTelemetryEvent'

export const createTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/typebots',
      protect: true,
      summary: 'Create a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      workspaceId: z.string(),
      typebot: typebotCreateSchema,
    })
  )
  .output(
    z.object({
      typebot: typebotSchema,
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

    if (
      typebot.customDomain &&
      (await isCustomDomainNotAvailable(typebot.customDomain))
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

    const newTypebot = await prisma.typebot.create({
      data: {
        version: '5',
        workspaceId,
        name: typebot.name ?? 'My typebot',
        icon: typebot.icon,
        selectedThemeTemplateId: typebot.selectedThemeTemplateId,
        groups: typebot.groups
          ? await sanitizeGroups(workspaceId)(typebot.groups)
          : defaultGroups(),
        theme: typebot.theme ? typebot.theme : defaultTheme,
        settings: typebot.settings
          ? sanitizeSettings(typebot.settings, workspace.plan)
          : defaultSettings({
              isBrandingEnabled: workspace.plan === Plan.FREE,
            }),
        folderId: typebot.folderId,
        variables: typebot.variables ?? [],
        edges: typebot.edges ?? [],
        resultsTablePreferences: typebot.resultsTablePreferences ?? undefined,
        publicId: typebot.publicId ?? undefined,
        customDomain: typebot.customDomain ?? undefined,
      },
    })

    const parsedNewTypebot = typebotSchema.parse(newTypebot)

    await sendTelemetryEvents([
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

const defaultGroups = () => {
  const groupId = createId()
  return [
    {
      id: groupId,
      title: 'Start',
      graphCoordinates: { x: 0, y: 0 },
      blocks: [
        {
          groupId,
          id: createId(),
          label: 'Start',
          type: 'start',
        },
      ],
    },
  ]
}
