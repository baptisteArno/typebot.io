import { Elysia, t } from 'elysia'
import { startChat } from './startChat'
import { startChatPreview } from './startChatPreview'
import { getAuthenticatedUserId } from '../../auth'
import { cors } from '@elysiajs/cors'
import { continueChat } from './continueChat'
import { getMessageStream } from './getMessageStream'
import { Stream } from '@elysiajs/stream'
import { StreamingTextResponse } from 'ai'

export const apiRuntime = new Elysia()
  .use(cors())
  .post(
    '/api/v1/typebots/:id/startChat',
    async ({ headers, params, body, set }) => {
      const { corsOrigin, ...response } = await startChat({
        ...params,
        ...body,
        publicId: params.id,
        isStreamEnabled: body.isStreamEnabled ?? true,
        isOnlyRegistering: body.isOnlyRegistering ?? false,
        origin: headers.origin,
      })
      if (corsOrigin) set.headers['Access-Control-Allow-Origin'] = corsOrigin
      return response
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        message: t.Optional(t.String()),
        isStreamEnabled: t.Optional(t.Boolean()),
        resultId: t.Optional(t.String()),
        isOnlyRegistering: t.Optional(t.Boolean()),
        prefilledVariables: t.Optional(t.Record(t.String(), t.Unknown())),
      }),
    }
  )
  .post(
    '/api/v1/typebots/:id/preview/startChat',
    async ({ params, body, headers }) => {
      const userId = !body.typebot
        ? await getAuthenticatedUserId(headers)
        : undefined
      return startChatPreview({
        ...params,
        ...body,
        typebotId: params.id,
        userId,
        isStreamEnabled: body.isStreamEnabled ?? true,
        isOnlyRegistering: body.isOnlyRegistering ?? false,
      })
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        message: t.Optional(t.String()),
        isStreamEnabled: t.Optional(t.Boolean()),
        resultId: t.Optional(t.String()),
        isOnlyRegistering: t.Optional(t.Boolean()),
        prefilledVariables: t.Optional(t.Record(t.String(), t.Unknown())),
        startFrom: t.Optional(
          t.Union([
            t.Object({
              type: t.Literal('group'),
              groupId: t.String(),
            }),
            t.Object({
              type: t.Literal('event'),
              eventId: t.String(),
            }),
          ])
        ),
        typebot: t.Optional(t.Any()),
      }),
    }
  )
  .post(
    '/api/v1/sessions/:sessionId/continueChat',
    async ({ params, body, headers, set }) => {
      const { corsOrigin, ...response } = await continueChat({
        ...params,
        ...body,
        origin: headers.origin,
      })
      if (corsOrigin) set.headers['Access-Control-Allow-Origin'] = corsOrigin
      return response
    },
    {
      params: t.Object({
        sessionId: t.String(),
      }),
      body: t.Object({
        message: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/api/v1/sessions/:sessionId/streamMessage',
    async ({ params, body, set }) => {
      const { stream, status, message } = await getMessageStream({
        sessionId: params.sessionId,
        messages: body.messages,
      })
      if (!stream) {
        set.status = status
        return message
      }
      return new Stream(new StreamingTextResponse(stream))
    },
    {
      params: t.Object({
        sessionId: t.String(),
      }),
      body: t.Object({
        messages: t.Optional(t.Array(t.Any())),
      }),
    }
  )
