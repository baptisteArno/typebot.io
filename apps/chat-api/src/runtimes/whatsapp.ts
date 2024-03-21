import { receiveMessage } from '@typebot.io/bot-engine/apiHandlers/receiveMessage'
import { receiveMessagePreview } from '@typebot.io/bot-engine/apiHandlers/receiveMessagePreview'
import { tbValidator } from '@hono/typebox-validator'
import { Hono } from 'hono'
import { Type as t } from '@sinclair/typebox'

export const whatsAppRuntime = new Hono()

whatsAppRuntime.post(
  '/api/v1/workspaces/:workspaceId/whatsapp/:credentialsId/webhook',
  tbValidator(
    'json',
    t.Object({
      object: t.String(),
      entry: t.Any(),
    }),
    (result, c) => {
      if (!result.success) return c.json({ message: 'Invalid input' }, 400)
    }
  ),
  async (c) => {
    const data = c.req.valid('json')
    receiveMessage({
      workspaceId: c.req.param('workspaceId'),
      credentialsId: c.req.param('credentialsId'),
      ...data,
    })
    return c.json({ message: 'Webhook received' }, 200)
  }
)

whatsAppRuntime.post(
  '/api/v1/whatsapp/preview/webhook',
  tbValidator(
    'json',
    t.Object({
      object: t.String(),
      entry: t.Any(),
    }),
    (result, c) => {
      if (!result.success) return c.json({ message: 'Invalid input' }, 400)
    }
  ),
  async (c) => {
    const data = c.req.valid('json')
    receiveMessagePreview({
      ...data,
    })
    return c.json({ message: 'Webhook received' }, 200)
  }
)
