import prisma from '@/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { decrypt } from '@typebot.io/lib/api'
import { ZemanticAiCredentials } from '@typebot.io/schemas/features/blocks/integrations/zemanticAi'
import got from 'got'

export const listProjects = authenticatedProcedure
  .meta({
    openapi: {
      method: 'GET',
      path: '/zemantic-ai/projects',
      protect: true,
      summary: 'List Zemantic AI projects',
      tags: ['ZemanticAi'],
    },
  })
  .input(
    z.object({
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
  .query(async ({ input: { credentialsId, workspaceId }, ctx: { user } }) => {
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
    )) as ZemanticAiCredentials['data']

    const url = 'https://api.zemantic.ai/v1/projects'

    try {
      const response = await got
        .get(url, {
          headers: {
            Authorization: `Bearer ${data.apiKey}`,
          },
        })
        .json()

      const projectsData = response as {
        id: string
        name: string
      }[]

      return {
        projects: projectsData.map((project) => ({
          label: project.name,
          value: project.id,
        })),
      }
    } catch (e) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Could not list projects',
        cause: e,
      })
    }
  })
