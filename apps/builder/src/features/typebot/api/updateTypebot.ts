import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { typebotSchema } from '@typebot.io/schemas'
import { z } from 'zod'
import {
  isCustomDomainNotAvailable,
  isPublicIdNotAvailable,
  sanitizeGroups,
  sanitizeSettings,
} from '../helpers/sanitizers'
import { isWriteTypebotForbidden } from '../helpers/isWriteTypebotForbidden'
import { isCloudProdInstance } from '@/helpers/isCloudProdInstance'

export const updateTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'PATCH',
      path: '/typebots/{typebotId}',
      protect: true,
      summary: 'Update a typebot',
      tags: ['Typebot'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      typebot: typebotSchema
        .pick({
          name: true,
          icon: true,
          selectedThemeTemplateId: true,
          groups: true,
          theme: true,
          settings: true,
          folderId: true,
          variables: true,
          edges: true,
          isClosed: true,
          resultsTablePreferences: true,
          publicId: true,
          customDomain: true,
        })
        .partial(),
      updatedAt: z
        .date()
        .optional()
        .describe(
          'Used for checking if there is a newer version of the typebot in the database'
        ),
    })
  )
  .output(
    z.object({
      typebot: typebotSchema,
    })
  )
  .mutation(
    async ({ input: { typebotId, typebot, updatedAt }, ctx: { user } }) => {
      const existingTypebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
        },
        select: {
          id: true,
          customDomain: true,
          publicId: true,
          workspaceId: true,
          collaborators: {
            select: {
              userId: true,
              type: true,
            },
          },
          workspace: {
            select: {
              plan: true,
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
        updatedAt &&
        updatedAt.getTime() > new Date(existingTypebot?.updatedAt).getTime()
      )
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Found newer version of the typebot in database',
        })

      if (
        typebot.customDomain &&
        existingTypebot.customDomain !== typebot.customDomain &&
        (await isCustomDomainNotAvailable(typebot.customDomain))
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Custom domain not available',
        })

      if (typebot.publicId) {
        if (isCloudProdInstance && typebot.publicId.length < 4)
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

      const newTypebot = await prisma.typebot.update({
        where: {
          id: existingTypebot.id,
        },
        data: {
          version: '5',
          name: typebot.name,
          icon: typebot.icon,
          selectedThemeTemplateId: typebot.selectedThemeTemplateId,
          groups: typebot.groups
            ? await sanitizeGroups(existingTypebot.workspaceId)(typebot.groups)
            : undefined,
          theme: typebot.theme ? typebot.theme : undefined,
          settings: typebot.settings
            ? sanitizeSettings(typebot.settings, existingTypebot.workspace.plan)
            : undefined,
          folderId: typebot.folderId,
          variables: typebot.variables,
          edges: typebot.edges,
          resultsTablePreferences: typebot.resultsTablePreferences ?? undefined,
          publicId: typebot.publicId ?? undefined,
          customDomain: typebot.customDomain ?? undefined,
          isClosed: typebot.isClosed,
        },
      })

      return { typebot: typebotSchema.parse(newTypebot) }
    }
  )
