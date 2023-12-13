import prisma from '@typebot.io/lib/prisma'
import { authenticatedProcedure } from '@/helpers/server/trpc'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { isReadWorkspaceFobidden } from '@/features/workspace/helpers/isReadWorkspaceFobidden'
import { forgedBlocks } from '@typebot.io/forge-schemas'
import { decrypt } from '@typebot.io/lib/api/encryption/decrypt'

export const fetchSelectItems = authenticatedProcedure
  .input(
    z.object({
      integrationId: z.string(),
      fetcherId: z.string(),
      options: z.any(),
      workspaceId: z.string(),
    })
  )
  .output(
    z.object({
      items: z.array(
        z.string().or(z.object({ label: z.string(), value: z.string() }))
      ),
    })
  )
  .query(
    async ({
      input: { workspaceId, integrationId, fetcherId, options },
      ctx: { user },
    }) => {
      if (!options.credentialsId) return { items: [] }

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
              id: options.credentialsId,
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

      if (!credentials) return { items: [] }

      const credentialsData = await decrypt(credentials.data, credentials.iv)

      const blockDef = forgedBlocks.find((b) => b.id === integrationId)

      const fetchers = (blockDef?.fetchers ?? []).concat(
        blockDef?.actions.flatMap((action) => action.fetchers ?? []) ?? []
      )
      const fetcher = fetchers.find((fetcher) => fetcher.id === fetcherId)

      if (!fetcher) return { items: [] }

      return {
        items: await fetcher.fetch({
          credentials: credentialsData,
          options,
        }),
      }
    }
  )
