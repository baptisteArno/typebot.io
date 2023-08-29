import { authenticatedProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import got, { HTTPError } from 'got'
import { getViewerUrl } from '@typebot.io/lib/getViewerUrl'
import prisma from '@/lib/prisma'
import { TRPCError } from '@trpc/server'

export const sendWhatsAppInitialMessage = authenticatedProcedure
  .input(
    z.object({
      to: z.string(),
      typebotId: z.string(),
      startGroupId: z.string().optional(),
    })
  )
  .mutation(
    async ({ input: { to, typebotId, startGroupId }, ctx: { user } }) => {
      const apiToken = await prisma.apiToken.findFirst({
        where: { ownerId: user.id },
        select: {
          token: true,
        },
      })
      if (!apiToken)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Api Token not found',
        })
      try {
        await got.post({
          method: 'POST',
          url: `${getViewerUrl()}/api/v1/typebots/${typebotId}/whatsapp/start-preview`,
          headers: {
            Authorization: `Bearer ${apiToken.token}`,
          },
          json: { to, isPreview: true, startGroupId },
        })
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Request to viewer failed',
          cause: error instanceof HTTPError ? error.response.body : error,
        })
      }

      return { message: 'success' }
    }
  )
