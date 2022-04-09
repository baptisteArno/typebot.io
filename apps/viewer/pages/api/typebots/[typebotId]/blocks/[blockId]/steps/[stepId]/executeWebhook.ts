import prisma from 'libs/prisma'
import {
  defaultWebhookAttributes,
  HttpMethod,
  KeyValue,
  PublicTypebot,
  ResultValues,
  Typebot,
  Variable,
  Webhook,
  WebhookOptions,
  WebhookResponse,
  WebhookStep,
} from 'models'
import { parseVariables } from 'bot-engine'
import { NextApiRequest, NextApiResponse } from 'next'
import got, { Method, Headers, HTTPError } from 'got'
import {
  byId,
  initMiddleware,
  methodNotAllowed,
  notFound,
  parseAnswers,
} from 'utils'
import { stringify } from 'qs'
import { withSentry } from '@sentry/nextjs'
import Cors from 'cors'
import { parseSampleResult } from 'services/api/webhooks'

const cors = initMiddleware(Cors())
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId.toString()
    const blockId = req.query.blockId.toString()
    const stepId = req.query.stepId.toString()
    const { resultValues, variables } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues | undefined
      variables: Variable[]
    }
    const typebot = (await prisma.typebot.findUnique({
      where: { id: typebotId },
      include: { webhooks: true },
    })) as unknown as (Typebot & { webhooks: Webhook[] }) | null
    if (!typebot) return notFound(res)
    const step = typebot.blocks
      .find(byId(blockId))
      ?.steps.find(byId(stepId)) as WebhookStep
    const webhook = typebot.webhooks.find(byId(step.webhookId))
    if (!webhook)
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const preparedWebhook = prepareWebhookAttributes(webhook, step.options)
    const result = await executeWebhook(typebot)(
      preparedWebhook,
      variables,
      blockId,
      resultValues
    )
    return res.status(200).send(result)
  }
  return methodNotAllowed(res)
}

const prepareWebhookAttributes = (
  webhook: Webhook,
  options: WebhookOptions
): Webhook => {
  if (options.isAdvancedConfig === false) {
    return { ...webhook, body: '{{state}}', ...defaultWebhookAttributes }
  } else if (options.isCustomBody === false) {
    return { ...webhook, body: '{{state}}' }
  }
  return webhook
}

const executeWebhook =
  (typebot: Typebot) =>
  async (
    webhook: Webhook,
    variables: Variable[],
    blockId: string,
    resultValues?: ResultValues
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
        h.value?.toLowerCase()?.includes('basic')
    )
    const isUsernamePasswordBasicAuth =
      basicAuthHeaderIdx !== -1 &&
      webhook.headers[basicAuthHeaderIdx].value?.includes(':')
    if (isUsernamePasswordBasicAuth) {
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
    const body =
      webhook.method !== HttpMethod.GET
        ? getBodyContent(typebot)({
            body: webhook.body,
            resultValues,
            blockId,
          })
        : undefined
    try {
      const response = await got(
        parseVariables(variables)(
          webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
        ),
        {
          method: webhook.method as Method,
          headers,
          ...basicAuth,
          json:
            contentType !== 'x-www-form-urlencoded' && body
              ? JSON.parse(parseVariables(variables)(body))
              : undefined,
          form:
            contentType === 'x-www-form-urlencoded' && body
              ? JSON.parse(parseVariables(variables)(body))
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
      console.error(error)
      return {
        statusCode: 500,
        data: { message: `Error from Typebot server: ${error}` },
      }
    }
  }

const getBodyContent =
  (typebot: Pick<Typebot | PublicTypebot, 'blocks' | 'variables' | 'edges'>) =>
  ({
    body,
    resultValues,
    blockId,
  }: {
    body?: string | null
    resultValues?: ResultValues
    blockId: string
  }): string | undefined => {
    if (!body) return
    return body === '{{state}}'
      ? JSON.stringify(
          resultValues
            ? parseAnswers(typebot)(resultValues)
            : parseSampleResult(typebot)(blockId)
        )
      : body
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
