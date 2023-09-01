import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { Configuration, OpenAIApi, ResponseTypes } from 'openai-edge'
import { decrypt } from '@typebot.io/lib/api'
import { OpenAICredentials } from '@typebot.io/schemas/features/blocks/integrations/openai'
import { IntegrationBlockType, typebotSchema } from '@typebot.io/schemas'
import { isNotEmpty } from '@typebot.io/lib/utils'

export const listModels = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/blocks/{blockId}/openai/models',
      protect: true,
      summary: 'List OpenAI models',
      tags: ['OpenAI'],
    },
  })
  .input(
    z.object({
      typebotId: z.string(),
      blockId: z.string(),
      credentialsId: z.string(),
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      models: z.array(z.string()),
    })
  )
  .query(
    async ({
      input: { credentialsId, workspaceId, typebotId, blockId },
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
          typebots: {
            where: {
              id: typebotId,
            },
            select: {
              groups: true,
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

      const typebot = workspace.typebots.at(0)

      if (!typebot)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Typebot not found',
        })

      const block = typebotSchema._def.schema.shape.groups
        .parse(workspace.typebots.at(0)?.groups)
        .flatMap((group) => group.blocks)
        .find((block) => block.id === blockId)

      if (!block || block.type !== IntegrationBlockType.OPEN_AI)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'OpenAI block not found',
        })

      const data = (await decrypt(
        credentials.data,
        credentials.iv
      )) as OpenAICredentials['data']

      const config = new Configuration({
        apiKey: data.apiKey,
        basePath: block.options.baseUrl,
        baseOptions: {
          headers: {
            'api-key': data.apiKey,
          },
        },
        defaultQueryParams: isNotEmpty(block.options.apiVersion)
          ? new URLSearchParams({
              'api-version': block.options.apiVersion,
            })
          : undefined,
      })

      const openai = new OpenAIApi(config)

      const response = await openai.listModels()

      const modelsData = (await response.json()) as ResponseTypes['listModels']

      return {
        models: modelsData.data
          .sort((a, b) => b.created - a.created)
          .map((model) => model.id),
      }
    }
  )
