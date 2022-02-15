import prisma from 'libs/prisma'
import { KeyValue, Typebot, Variable, Webhook, WebhookResponse } from 'models'
import { parseVariables } from 'bot-engine'
import { NextApiRequest, NextApiResponse } from 'next'
import got, { Method, Headers, HTTPError } from 'got'
import { byId, initMiddleware, methodNotAllowed } from 'utils'
import { stringify } from 'qs'
import { withSentry } from '@sentry/nextjs'
import Cors from 'cors'

const cors = initMiddleware(Cors())
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId.toString()
    const blockId = req.query.blockId.toString()
    const stepId = req.query.stepId.toString()
    const variables = JSON.parse(req.body).variables as Variable[]
    const typebot = await prisma.typebot.findUnique({
      where: { id: typebotId },
    })
    const step = (typebot as unknown as Typebot).blocks
      .find(byId(blockId))
      ?.steps.find(byId(stepId))
    if (!step || !('webhook' in step))
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const result = await executeWebhook(step.webhook, variables)
    return res.status(200).send(result)
  }
  return methodNotAllowed(res)
}

const executeWebhook = async (
  webhook: Webhook,
  variables: Variable[]
): Promise<WebhookResponse> => {
  if (!webhook.url || !webhook.method)
    return {
      statusCode: 400,
      data: { message: `Webhook doesn't have url or method` },
    }
  const basicAuth: { username?: string; password?: string } = {}
  const basicAuthHeaderIdx = webhook.headers.findIndex(
    (h) =>
      h.key?.toLowerCase() === 'authorization' &&
      h.value?.toLowerCase().includes('basic')
  )
  if (basicAuthHeaderIdx !== -1) {
    const [username, password] =
      webhook.headers[basicAuthHeaderIdx].value?.slice(6).split(':') ?? []
    basicAuth.username = username
    basicAuth.password = password
    webhook.headers.splice(basicAuthHeaderIdx, 1)
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
      parseVariables(variables)(webhook.url + `?${queryParams}`),
      {
        method: webhook.method as Method,
        headers,
        ...basicAuth,
        json:
          contentType !== 'x-www-form-urlencoded' && webhook.body
            ? JSON.parse(parseVariables(variables)(webhook.body))
            : undefined,
        form:
          contentType === 'x-www-form-urlencoded' && webhook.body
            ? JSON.parse(parseVariables(variables)(webhook.body))
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
  keyValues: KeyValue[] | undefined,
  variables: Variable[]
) => {
  if (!keyValues) return
  return keyValues.reduce((object, item) => {
    if (!item.key) return {}
    return {
      ...object,
      [item.key]: parseVariables(variables)(item.value ?? ''),
    }
  }, {})
}

export default withSentry(handler)
