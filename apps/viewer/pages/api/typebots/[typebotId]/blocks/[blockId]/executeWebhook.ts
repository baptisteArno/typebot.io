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
  WebhookBlock,
} from 'models'
import { parseVariables } from 'bot-engine'
import { NextApiRequest, NextApiResponse } from 'next'
import got, { Method, Headers, HTTPError } from 'got'
import {
  byId,
  initMiddleware,
  methodNotAllowed,
  notFound,
  omit,
  parseAnswers,
} from 'utils'
import { stringify } from 'qs'
import { withSentry } from '@sentry/nextjs'
import Cors from 'cors'
import { parseSampleResult } from 'services/api/webhooks'
import {
  getLinkedTypebots,
  saveErrorLog,
  saveSuccessLog,
} from 'services/api/utils'

const cors = initMiddleware(Cors())
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
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
    const block = typebot.groups
      .flatMap((g) => g.blocks)
      .find(byId(blockId)) as WebhookBlock
    const webhook = typebot.webhooks.find(byId(block.webhookId))
    if (!webhook)
      return res
        .status(404)
        .send({ statusCode: 404, data: { message: `Couldn't find webhook` } })
    const preparedWebhook = prepareWebhookAttributes(webhook, block.options)
    const result = await executeWebhook(typebot)(
      preparedWebhook,
      variables,
      block.groupId,
      resultValues,
      resultId
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

const bodyIsSingleVariable = (body: string) => /{{.+}}/.test(body)

export const executeWebhook =
  (typebot: Typebot) =>
  async (
    webhook: Webhook,
    variables: Variable[],
    groupId: string,
    resultValues?: ResultValues,
    resultId?: string
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
    const linkedTypebots = await getLinkedTypebots(typebot)
    const body =
      webhook.method !== HttpMethod.GET
        ? await getBodyContent(
            typebot,
            linkedTypebots
          )({
            body: webhook.body,
            resultValues,
            groupId,
          })
        : undefined
    const request = {
      url: parseVariables(variables)(
        webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
      ),
      method: webhook.method as Method,
      headers,
      ...basicAuth,
      json:
        contentType !== 'x-www-form-urlencoded' && body
          ? safeJsonParse(
              parseVariables(variables, {
                escapeForJson: !bodyIsSingleVariable(body),
              })(body)
            )
          : undefined,
      form:
        contentType === 'x-www-form-urlencoded' && body
          ? safeJsonParse(
              parseVariables(variables, {
                escapeForJson: !bodyIsSingleVariable(body),
              })(body)
            )
          : undefined,
    }
    try {
      const response = await got(request.url, omit(request, 'url'))
      await saveSuccessLog(resultId, 'Webhook successfuly executed.', {
        statusCode: response.statusCode,
        request,
        response: parseBody(response.body),
      })
      return {
        statusCode: response.statusCode,
        data: parseBody(response.body),
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        const response = {
          statusCode: error.response.statusCode,
          data: parseBody(error.response.body as string),
        }
        await saveErrorLog(resultId, 'Webhook returned an error', {
          request,
          response,
        })
        return response
      }
      const response = {
        statusCode: 500,
        data: { message: `Error from Typebot server: ${error}` },
      }
      console.error(error)
      await saveErrorLog(resultId, 'Webhook failed to execute', {
        request,
        response,
      })
      return response
    }
  }

const getBodyContent =
  (
    typebot: Pick<Typebot | PublicTypebot, 'groups' | 'variables' | 'edges'>,
    linkedTypebots: (Typebot | PublicTypebot)[]
  ) =>
  async ({
    body,
    resultValues,
    groupId,
  }: {
    body?: string | null
    resultValues?: ResultValues
    groupId: string
  }): Promise<string | undefined> => {
    if (!body) return
    return body === '{{state}}'
      ? JSON.stringify(
          resultValues
            ? parseAnswers({
                groups: [
                  ...typebot.groups,
                  ...linkedTypebots.flatMap((t) => t.groups),
                ],
                variables: [
                  ...typebot.variables,
                  ...linkedTypebots.flatMap((t) => t.variables),
                ],
              })(resultValues)
            : await parseSampleResult(typebot, linkedTypebots)(groupId)
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJsonParse = (json: string): any => {
  try {
    return JSON.parse(json)
  } catch (err) {
    return json
  }
}

export default withSentry(handler)
