import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { decrypt } from '@typebot.io/lib/api'
import { ZemanticAiCredentials } from '@typebot.io/schemas/features/blocks/integrations/zemanticAi'
import { IntegrationBlockType, typebotSchema } from '@typebot.io/schemas'
import got from 'got'

export const listProjects = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/typebots/{typebotId}/blocks/{blockId}/zemanticai/prjects',
      protect: true,
      summary: 'List Zemantic AI projects',
      tags: ['ZemanticAi'],
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
      projects: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
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

      if (!block || block.type !== IntegrationBlockType.ZEMANTIC_AI)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Zemantic AI block not found',
        })

      const data = (await decrypt(
        credentials.data,
        credentials.iv
      )) as ZemanticAiCredentials['data']

      const url = 'https://api.zemantic.ai/v1/projects'

      let projectsData: { id: string; name: string }[] = []
      try {
        const response = await got
          .get(url, {
            headers: {
              Authorization: `Bearer ${data.apiKey}`,
            },
          })
          .json()

        projectsData = response as
          | {
              id: string
              name: string
            }[]
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not list projects',
          cause: 'unknown',
        })
      }

      return {
        projects:
          projectsData.map((p) => ({ label: p.name, value: p.id })) ?? [],
      }
    }
  )
