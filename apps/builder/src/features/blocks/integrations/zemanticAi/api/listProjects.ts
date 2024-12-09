import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'
import { ZemanticAiCredentials } from '@typebot.io/schemas/features/blocks/integrations/zemanticAi'
import ky from 'ky'

export const listProjects = authenticatedProcedure
  .input(
    z.object({
      credentialsId: z.string(),
      workspaceId: z.string(),
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

    if (!workspace || isReadWorkspaceFobidden(workspace, user)) {
      const message = `No workspace found or read forbidden. workspaceId: ${workspaceId}, credentialsId: ${credentialsId}`
      console.error(message)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message,
      })
    }

    const credentials = workspace.credentials.at(0)

    if (!credentials) {
      const message = `No credentials found for workspaceId: ${workspaceId}, credentialsId: ${credentialsId}`
      console.error(message)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message,
      })
    }

    const data = (await decrypt(
      credentials.data,
      credentials.iv
    )) as ZemanticAiCredentials['data']

    const url = 'https://api.zemantic.ai/v1/projects'

    try {
      const response = await ky
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
      const message = 'Could not list projects'
      console.error(`${message}. Cause: ${e}`)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message,
        cause: e,
      })
    }
  })
