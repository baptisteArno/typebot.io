import prisma from 'libs/prisma'
import {
  KeyValue,
  Table,
  Typebot,
  Variable,
  Webhook,
  WebhookResponse,
} from 'models'
import { parseVariables } from 'bot-engine'
import { NextApiRequest, NextApiResponse } from 'next'
import got, { Method, Headers, HTTPError } from 'got'
import { methodNotAllowed } from 'utils'
import { stringify } from 'qs'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId.toString()
    const webhookId = req.query.id.toString()
    const variables = JSON.parse(req.body).variables as Table<Variable>
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
    })
    const webhook = (typebot as Typebot).webhooks.byId[webhookId]
    const result = await executeWebhook(webhook, variables)
    return res.status(200).send(result)
  }
  return methodNotAllowed(res)
}

const executeWebhook = async (
  webhook: Webhook,
  variables: Table<Variable>
): Promise<WebhookResponse> => {
  if (!webhook.url || !webhook.method)
    return {
      statusCode: 400,
      data: { message: `Webhook doesn't have url or method` },
    }
  const headers = convertKeyValueTableToObject(webhook.headers, variables) as
    | Headers
    | undefined
  const queryParams = stringify(
    convertKeyValueTableToObject(webhook.queryParams, variables)
  )
  const contentType = headers ? headers['Content-Type'] : undefined
  try {
    const response = await got(
      parseVariables({ text: webhook.url + `?${queryParams}`, variables }),
      {
        method: webhook.method as Method,
        headers,
        json:
          contentType !== 'x-www-form-urlencoded' && webhook.body
            ? JSON.parse(parseVariables({ text: webhook.body, variables }))
            : undefined,
        form:
          contentType === 'x-www-form-urlencoded' && webhook.body
            ? JSON.parse(parseVariables({ text: webhook.body, variables }))
            : undefined,
      }
    )
    return {
      statusCode: response.statusCode,
      data: parseBody(response.body),
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      return {
        statusCode: error.response.statusCode,
        data: parseBody(error.response.body as string),
      }
    }
    return {
      statusCode: 500,
      data: { message: `Error from Typebot server: ${error}` },
    }
  }
}

const parseBody = (body: string) => {
  try {
    return JSON.parse(body)
  } catch (err) {
    return body
  }
}

const convertKeyValueTableToObject = (
  keyValues: Table<KeyValue> | undefined,
  variables: Table<Variable>
) => {
  if (!keyValues) return
  return keyValues.allIds.reduce((object, id) => {
    const item = keyValues.byId[id]
    if (!item.key) return {}
    return {
      ...object,
      [item.key]: parseVariables({ text: item.value, variables }),
    }
  }, {})
}

export default handler
