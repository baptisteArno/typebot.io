import { Webhook as WebhookFromPrisma } from '@typebot.io/prisma'
import { z } from 'zod'

export enum HttpMethod {
  POST = 'POST',
  GET = 'GET',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
}

export type KeyValue = { id: string; key?: string; value?: string }

export type Webhook = Omit<
  WebhookFromPrisma,
  'queryParams' | 'headers' | 'method' | 'createdAt' | 'updatedAt'
> & {
  queryParams: KeyValue[]
  headers: KeyValue[]
  method: HttpMethod
}

export type WebhookResponse = {
  statusCode: number
  data?: unknown
}

export const defaultWebhookAttributes: Omit<
  Webhook,
  'id' | 'body' | 'url' | 'typebotId' | 'createdAt' | 'updatedAt'
> = {
  method: HttpMethod.POST,
  headers: [],
  queryParams: [],
}

export const executableWebhookSchema = z.object({
  url: z.string(),
  headers: z.record(z.string()).optional(),
  body: z.unknown().optional(),
  method: z.nativeEnum(HttpMethod).optional(),
})

export type ExecutableWebhook = z.infer<typeof executableWebhookSchema>
