import { startChat } from '@typebot.io/bot-engine/apiHandlers/startChat'
import { continueChat } from '@typebot.io/bot-engine/apiHandlers/continueChat'
import { startChatPreview } from '@typebot.io/bot-engine/apiHandlers/startChatPreview'
import { getMessageStream } from '@typebot.io/bot-engine/apiHandlers/getMessageStream'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { tbValidator } from '@hono/typebox-validator'
import { Type as t } from '@sinclair/typebox'
import { getAuthenticatedUserId } from '../auth'

export const webRuntime = new Hono()

webRuntime.use('*', cors())

webRuntime.post(
  '/api/v1/typebots/:publicId/startChat',
  tbValidator(
    'json',
    t.Object({
      message: t.Optional(t.String()),
      isStreamEnabled: t.Optional(t.Boolean()),
      resultId: t.Optional(t.String()),
      isOnlyRegistering: t.Optional(t.Boolean()),
      prefilledVariables: t.Optional(t.Record(t.String(), t.Unknown())),
    }),
    (result, c) => {
      if (!result.success) return c.json({ message: 'Invalid input' }, 400)
    }
  ),
  async (c) => {
    const data = c.req.valid('json')
    const { corsOrigin, ...response } = await startChat({
      ...data,
      publicId: c.req.param('publicId'),
      isStreamEnabled: data.isStreamEnabled ?? true,
      isOnlyRegistering: data.isOnlyRegistering ?? false,
      origin: c.req.header('origin'),
    })
    if (corsOrigin) c.res.headers.set('Access-Control-Allow-Origin', corsOrigin)
    return c.json(response)
  }
)

webRuntime.post(
  '/api/v1/typebots/:id/preview/startChat',
  tbValidator(
    'json',
    t.Object({
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
    (result, c) => {
      if (!result.success) return c.json({ message: 'Invalid input' }, 400)
    }
  ),
  async (c) => {
    const data = c.req.valid('json')
    const userId = !data.typebot
      ? await getAuthenticatedUserId(c.req.header('Authorization'))
      : undefined
    return c.json(
      await startChatPreview({
        ...data,
        typebotId: c.req.param('id'),
        userId,
        isStreamEnabled: data.isStreamEnabled ?? true,
        isOnlyRegistering: data.isOnlyRegistering ?? false,
      })
    )
  }
)

webRuntime.post(
  '/api/v1/sessions/:sessionId/continueChat',
  tbValidator(
    'json',
    t.Object({
      message: t.Optional(t.String()),
    }),
    (result, c) => {
      if (!result.success) return c.json({ message: 'Invalid input' }, 400)
    }
  ),
  async (c) => {
    const data = c.req.valid('json')
    const { corsOrigin, ...response } = await continueChat({
      ...data,
      sessionId: c.req.param('sessionId'),
      origin: c.req.header('origin'),
    })
    if (corsOrigin) c.res.headers.set('Access-Control-Allow-Origin', corsOrigin)
    return c.json(response)
  }
)

webRuntime.post(
  '/api/v1/sessions/:sessionId/streamMessage',
  tbValidator(
    'json',
    t.Object({
      messages: t.Optional(t.Array(t.Any())),
    }),
    (result, c) => {
      if (!result.success) return c.json({ message: 'Invalid input' }, 400)
    }
  ),
  async (c) => {
    const data = c.req.valid('json')
    const { stream, status, message } = await getMessageStream({
      sessionId: c.req.param('sessionId'),
      messages: data.messages,
    })
    if (!stream) return c.json({ message }, (status ?? 400) as ResponseInit)
    return new Response(stream)
  }
)
