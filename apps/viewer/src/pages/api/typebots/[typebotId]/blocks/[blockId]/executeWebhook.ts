import {
  defaultWebhookAttributes,
  KeyValue,
  PublicTypebot,
  ResultValues,
  Typebot,
  Variable,
  Webhook,
  WebhookOptions,
  WebhookResponse,
  WebhookBlock,
  HttpMethod,
} from '@typebot.io/schemas'
import { NextApiRequest, NextApiResponse } from 'next'
import got, { Method, Headers, HTTPError } from 'got'
import { byId, omit } from '@typebot.io/lib'
import { parseAnswers } from '@typebot.io/lib/results'
import { initMiddleware, methodNotAllowed, notFound } from '@typebot.io/lib/api'
import { stringify } from 'qs'
import Cors from 'cors'
import prisma from '@/lib/prisma'
import { parseVariables } from '@/features/variables/parseVariables'
import { parseSampleResult } from '@/features/blocks/integrations/webhook/parseSampleResult'
import { fetchLinkedTypebots } from '@/features/blocks/logic/typebotLink/fetchLinkedTypebots'
import { getPreviouslyLinkedTypebots } from '@/features/blocks/logic/typebotLink/getPreviouslyLinkedTypebots'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'

const cors = initMiddleware(Cors())

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await cors(req, res)
  if (req.method === 'POST') {
    const typebotId = req.query.typebotId as string
    const blockId = req.query.blockId as string
    const resultId = req.query.resultId as string | undefined
    const { resultValues, variables, parentTypebotIds } = (
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    ) as {
      resultValues: ResultValues | undefined
      variables: Variable[]
      parentTypebotIds: string[]
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
    const result = await executeWebhook(typebot)({
      webhook: preparedWebhook,
      variables,
      groupId: block.groupId,
      resultValues,
      resultId,
      parentTypebotIds,
    })
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

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body)

export const executeWebhook =
  (typebot: Typebot) =>
  async ({
    webhook,
    variables,
    groupId,
    resultValues,
    resultId,
    parentTypebotIds = [],
  }: {
    webhook: Webhook
    variables: Variable[]
    groupId: string
    resultValues?: ResultValues
    resultId?: string
    parentTypebotIds: string[]
  }): Promise<WebhookResponse> => {
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
    const linkedTypebotsParents = await fetchLinkedTypebots({
      isPreview: !('typebotId' in typebot),
      typebotIds: parentTypebotIds,
    })
    const linkedTypebotsChildren = await getPreviouslyLinkedTypebots({
      isPreview: !('typebotId' in typebot),
      typebots: [typebot],
    })([])
    const bodyContent = await getBodyContent(typebot, [
      ...linkedTypebotsParents,
      ...linkedTypebotsChildren,
    ])({
      body: webhook.body,
      resultValues,
      groupId,
      variables,
    })
    const { data: body, isJson } =
      bodyContent && webhook.method !== HttpMethod.GET
        ? safeJsonParse(
            parseVariables(variables, {
              escapeForJson: !checkIfBodyIsAVariable(bodyContent),
            })(bodyContent)
          )
        : { data: undefined, isJson: false }

    const request = {
      url: parseVariables(variables)(
        webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
      ),
      method: webhook.method as Method,
      headers,
      ...basicAuth,
      json:
        !contentType?.includes('x-www-form-urlencoded') && body && isJson
          ? body
          : undefined,
      form:
        contentType?.includes('x-www-form-urlencoded') && body
          ? body
          : undefined,
      body: body && !isJson ? body : undefined,
    }
    try {
      const response = await got(request.url, omit(request, 'url'))
      await saveSuccessLog({
        resultId,
        message: 'Webhook successfuly executed.',
        details: {
          statusCode: response.statusCode,
          request,
          response: safeJsonParse(response.body).data,
        },
      })
      return {
        statusCode: response.statusCode,
        data: safeJsonParse(response.body).data,
      }
    } catch (error) {
      if (error instanceof HTTPError) {
        const response = {
          statusCode: error.response.statusCode,
          data: safeJsonParse(error.response.body as string).data,
        }
        await saveErrorLog({
          resultId,
          message: 'Webhook returned an error',
          details: {
            request,
            response,
          },
        })
        return response
      }
      const response = {
        statusCode: 500,
        data: { message: `Error from Typebot server: ${error}` },
      }
      console.error(error)
      await saveErrorLog({
        resultId,
        message: 'Webhook failed to execute',
        details: {
          request,
          response,
        },
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
    variables,
  }: {
    body?: string | null
    resultValues?: ResultValues
    groupId: string
    variables: Variable[]
  }): Promise<string | undefined> => {
    if (!body) return
    return body === '{{state}}'
      ? JSON.stringify(
          resultValues
            ? parseAnswers(typebot, linkedTypebots)(resultValues)
            : await parseSampleResult(typebot, linkedTypebots)(
                groupId,
                variables
              )
        )
      : body
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
const safeJsonParse = (json: string): { data: any; isJson: boolean } => {
  try {
    return { data: JSON.parse(json), isJson: true }
  } catch (err) {
    return { data: json, isJson: false }
  }
}

export default handler
