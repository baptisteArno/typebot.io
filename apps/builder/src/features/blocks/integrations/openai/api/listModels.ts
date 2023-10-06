import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import {
  OpenAICredentials,
  defaultBaseUrl,
} from '@typebot.io/schemas/features/blocks/integrations/openai'
import { isNotEmpty } from '@typebot.io/lib/utils'
import { OpenAI, ClientOptions } from 'openai'

export const listModels = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/openai/models',
      protect: true,
      summary: 'List OpenAI models',
      tags: ['OpenAI'],
    },
  })
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string(),
      baseUrl: z.string().default(defaultBaseUrl),
      apiVersion: z.string().optional(),
    })
  )
  .output(
    z.object({
      models: z.array(z.string()),
    })
  )
  .query(
    async ({
      input: { credentialsId, workspaceId, baseUrl, apiVersion },
      ctx: { user },
    }) => {
      const workspace = await prisma.workspace.findFirst({
        where: { id: workspaceId },
        select: {
          members: {
            select: {
              userId: true,
            },
          },
          credentials: {
            where: {
              id: credentialsId,
            },
            select: {
              id: true,
              data: true,
              iv: true,
            },
          },
        },
      })

      if (!workspace || isReadWorkspaceFobidden(workspace, user))
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No workspace found',
        })

      const credentials = workspace.credentials.at(0)

      if (!credentials)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No credentials found',
        })

      const data = (await decrypt(
        credentials.data,
        credentials.iv
      )) as OpenAICredentials['data']

      const config = {
        apiKey: data.apiKey,
        baseURL: baseUrl,
        defaultHeaders: {
          'api-key': data.apiKey,
        },
        defaultQuery: isNotEmpty(apiVersion)
          ? {
              'api-version': apiVersion,
            }
          : undefined,
      } satisfies ClientOptions

      const openai = new OpenAI(config)

      const models = await openai.models.list()

      return {
        models:
          models.data
            .sort((a, b) => b.created - a.created)
            .map((model) => model.id) ?? [],
      }
    }
  )
