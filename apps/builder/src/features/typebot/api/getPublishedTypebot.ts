import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import {
  Typebot,
  PublicTypebot,
  publicTypebotSchema,
  publicTypebotSchemaV5,
  publicTypebotSchemaV6,
} from '@typebot.io/schemas'
import { z } from 'zod'
import { isReadTypebotForbidden } from '../helpers/isReadTypebotForbidden'
import { migratePublicTypebot } from '@typebot.io/migrations/migrateTypebot'
import NodeCache from 'node-cache'
import logger from '@/helpers/logger'

export const getPublishedTypebot = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/publishedTypebot',
      protect: true,
      summary: 'Get published typebot',
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
      migrateToLatestVersion: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'If enabled, the typebot will be converted to the latest schema version'
        ),
    })
  )
  .output(
    z.object({
      publishedTypebot: publicTypebotSchema.nullable(),
      version: z
        .enum([
          ...publicTypebotSchemaV5._def.schema.shape.version._def.values,
          publicTypebotSchemaV6.shape.version._def.value,
        ])
        .optional()
        .describe(
          'Provides the version the published bot was migrated from if `migrateToLatestVersion` is set to `true`.'
        ),
    })
  )
  .query(
    async ({ input: { typebotId, migrateToLatestVersion }, ctx: { user } }) => {
      const existingTypebot = await prisma.typebot.findFirst({
        where: {
          id: typebotId,
        },
        include: {
          collaborators: true,
          publishedTypebot: true,
          workspace: {
            select: {
              name: true,
              isSuspended: true,
              isPastDue: true,
              members: {
                select: {
                  userId: true,
                },
              },
            },
          },
        },
      })
      if (
        !existingTypebot?.id ||
        (await isReadTypebotForbidden(existingTypebot, user))
      ) {
        logger.info(
          `Typebot not found or access forbidden for ID: ${typebotId}`
        )
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Typebot not found or access forbidden for ID: ${typebotId}`,
        })
      }

      if (!existingTypebot.publishedTypebot) {
        return {
          publishedTypebot: null,
        }
      }

      try {
        const parsedTypebot = migrateToLatestVersion
          ? await migratePublicTypebot(
              publicTypebotSchema.parse(existingTypebot.publishedTypebot)
            )
          : publicTypebotSchema.parse(existingTypebot.publishedTypebot)

        return {
          publishedTypebot: parsedTypebot,
          version: migrateToLatestVersion
            ? ((existingTypebot.version ?? '3') as Typebot['version'])
            : undefined,
        }
      } catch (err) {
        logger.error('Error parsing published typebot:', err)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: `Failed to parse published typebot: ${typebotId}`,
          cause: err,
        })
      }
    }
  )

const cache = new NodeCache({ stdTTL: 300 })

export const getPublishedTypebotCached = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/publishedTypebot/cached',
      protect: true,
      summary: 'Get cached published typebot',
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
      migrateToLatestVersion: z
        .boolean()
        .optional()
        .default(false)
        .describe(
          'If enabled, the typebot will be converted to the latest schema version'
        ),
    })
  )
  .output(
    z.object({
      publishedTypebot: publicTypebotSchema.nullable(),
      version: z
        .enum([
          ...publicTypebotSchemaV5._def.schema.shape.version._def.values,
          publicTypebotSchemaV6.shape.version._def.value,
        ])
        .optional()
        .describe(
          'Provides the version the published bot was migrated from if `migrateToLatestVersion` is set to `true`.'
        ),
    })
  )
  .query(
    async ({ input: { typebotId, migrateToLatestVersion }, ctx: { user } }) => {
      try {
        const cacheKey = `publishedTypebot:${typebotId}`
        const cachedData = cache.get(cacheKey)

        if (cachedData) {
          return cachedData
        }

        const existingTypebot = await prisma.typebot.findFirst({
          where: {
            id: typebotId,
          },
          include: {
            collaborators: true,
            publishedTypebot: true,
            workspace: {
              select: {
                isSuspended: true,
                isPastDue: true,
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        })

        if (
          !existingTypebot ||
          (await isReadTypebotForbidden(existingTypebot, user))
        ) {
          logger.info(
            'Typebot not found or access forbidden for ID:',
            typebotId
          )
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Typebot not found',
          })
        }

        if (
          !existingTypebot?.id ||
          (await isReadTypebotForbidden(existingTypebot, user))
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Typebot not found',
          })
        }
        if (!existingTypebot.publishedTypebot) {
          return {
            publishedTypebot: null,
          }
        }

        const parsedTypebot = migrateToLatestVersion
          ? await migratePublicTypebot(
              publicTypebotSchema.parse(existingTypebot.publishedTypebot)
            )
          : publicTypebotSchema.parse(existingTypebot.publishedTypebot)

        const result = {
          publishedTypebot: parsedTypebot,
          version: migrateToLatestVersion
            ? ((existingTypebot.version ?? '3') as Typebot['version'])
            : undefined,
        }

        cache.set(cacheKey, result)

        return result
      } catch (err) {
        logger.error('Error in getPublishedTypebotCached:', err)
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to parse published typebot',
          cause: err,
        })
      }
    }
  )

export const getPublishedTypebotVariables = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/v1/typebots/{typebotId}/publishedTypebot/variables',
      protect: true,
      summary: 'Get published typebot variables',
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
    })
  )
  .output(
    z.object({
      publishedTypebot: z
        .object({
          groups: z.array(
            z.object({
              blocks: z.array(
                z.object({
                  type: z.string(),
                  options: z
                    .object({
                      labels: z
                        .object({
                          placeholder: z.string().optional(),
                        })
                        .optional(),
                      variableId: z.string().optional(),
                    })
                    .optional(),
                })
              ),
            })
          ),
          variables: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
            })
          ),
        })
        .nullable(),
    })
  )
  .query(async ({ input: { typebotId }, ctx: { user } }) => {
    try {
      const cacheKey = `publishedTypebot:${typebotId}`
      const cachedData = cache.get(cacheKey) as
        | {
            publishedTypebot: PublicTypebot | Typebot | null
            version: Typebot['version'] | undefined
          }
        | undefined

      let typebotData = cachedData

      if (!typebotData) {
        const existingTypebot = await prisma.typebot.findFirst({
          where: {
            id: typebotId,
          },
          include: {
            collaborators: true,
            publishedTypebot: true,
            workspace: {
              select: {
                isSuspended: true,
                isPastDue: true,
                members: {
                  select: {
                    userId: true,
                  },
                },
              },
            },
          },
        })

        if (
          !existingTypebot ||
          (await isReadTypebotForbidden(existingTypebot, user))
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Typebot not found',
          })
        }

        if (
          !existingTypebot?.id ||
          (await isReadTypebotForbidden(existingTypebot, user))
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Typebot not found',
          })
        }

        if (!existingTypebot.publishedTypebot) {
          return {
            publishedTypebot: null,
          }
        }

        const parsedTypebot = publicTypebotSchema.parse(
          existingTypebot.publishedTypebot
        )

        typebotData = {
          publishedTypebot: parsedTypebot,
          version: existingTypebot.version as Typebot['version'],
        }

        cache.set(cacheKey, typebotData)
      }

      if (!typebotData?.publishedTypebot) {
        return {
          publishedTypebot: null,
        }
      }

      const groups = typebotData.publishedTypebot.groups.map((group) => ({
        blocks: group.blocks.map((block) => {
          const options = (
            block as unknown as {
              options?: {
                labels?: { placeholder?: string }
                variableId?: string
              }
            }
          ).options
          return {
            type: block.type,
            options: options
              ? {
                  labels: options.labels
                    ? {
                        placeholder: options.labels.placeholder,
                      }
                    : undefined,
                  variableId: options.variableId,
                }
              : undefined,
          }
        }),
      }))

      const variables = typebotData.publishedTypebot.variables.map(
        (variable) => ({
          id: variable.id,
          name: variable.name,
        })
      )

      return {
        publishedTypebot: {
          groups,
          variables,
        },
      }
    } catch (err) {
      logger.error('Error in getPublishedTypebotVariables:', err)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to retrieve published typebot variables',
        cause: err as Error,
      })
    }
  })
