import { publicProcedure } from '@/helpers/server/trpc'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'
import { sendWhatsAppMessage } from '../helpers/sendWhatsAppMessage'
import { startSession } from '@/features/chat/helpers/startSession'
import { restartSession } from '@/features/chat/queries/restartSession'
import { env } from '@typebot.io/env'
import { HTTPError } from 'got'
import prisma from '@/lib/prisma'
import { sendChatReplyToWhatsApp } from '../helpers/sendChatReplyToWhatsApp'
import { saveStateToDatabase } from '@/features/chat/helpers/saveStateToDatabase'

export const startWhatsAppPreview = publicProcedure
  .meta({
    openapi: {
      method: 'POST',
      path: '/typebots/{typebotId}/whatsapp/start-preview',
      summary: 'Start WhatsApp Preview',
      protect: true,
    },
  })
  .input(
    z.object({
      to: z
        .string()
        .min(1)
        .transform((value) => value.replace(/\s/g, '').replace(/\+/g, '')),
      typebotId: z.string(),
      startGroupId: z.string().optional(),
    })
  )
  .output(
    z.object({
      message: z.string(),
    })
  )
  .mutation(
    async ({ input: { to, typebotId, startGroupId }, ctx: { user } }) => {
      if (
        !env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID ||
        !env.META_SYSTEM_USER_TOKEN
      )
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Missing WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID and/or META_SYSTEM_USER_TOKEN env variables',
        })
      if (!user)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'You need to authenticate your request in order to start a preview',
        })

      const sessionId = `wa-${to}-preview`

      const existingSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
        },
        select: {
          updatedAt: true,
        },
      })

      // For users that did not interact with the bot in the last 24 hours, we need to send a template message.
      const canSendDirectMessagesToUser =
        (existingSession?.updatedAt.getTime() ?? 0) >
        Date.now() - 24 * 60 * 60 * 1000

      const { newSessionState, messages, input, clientSideActions, logs } =
        await startSession({
          startParams: {
            isOnlyRegistering: !canSendDirectMessagesToUser,
            typebot: typebotId,
            isPreview: true,
            startGroupId,
          },
          userId: user.id,
        })

      if (canSendDirectMessagesToUser) {
        await sendChatReplyToWhatsApp({
          to,
          typingEmulation: newSessionState.typingEmulation,
          messages,
          input,
          clientSideActions,
          credentials: {
            phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID,
            systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
          },
        })
        await saveStateToDatabase({
          clientSideActions: [],
          input,
          logs,
          session: {
            id: sessionId,
            state: {
              ...newSessionState,
              currentBlock: !input ? undefined : newSessionState.currentBlock,
            },
          },
        })
      } else {
        await restartSession({
          state: newSessionState,
          id: `wa-${to}-preview`,
        })
        try {
          await sendWhatsAppMessage({
            to,
            message: {
              type: 'template',
              template: {
                language: {
                  code: 'en',
                },
                name: 'preview_initial_message',
              },
            },
            credentials: {
              phoneNumberId: env.WHATSAPP_PREVIEW_FROM_PHONE_NUMBER_ID,
              systemUserAccessToken: env.META_SYSTEM_USER_TOKEN,
            },
          })
        } catch (err) {
          if (err instanceof HTTPError) console.log(err.response.body)
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Request to Meta to send preview message failed',
            cause: err,
          })
        }
      }
      return {
        message: 'success',
      }
    }
  )
