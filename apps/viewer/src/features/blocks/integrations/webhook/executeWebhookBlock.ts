import prisma from '@/lib/prisma'
import {
  WebhookBlock,
  ZapierBlock,
  MakeComBlock,
  PabblyConnectBlock,
  SessionState,
  Webhook,
  Typebot,
  Variable,
  WebhookResponse,
  WebhookOptions,
  defaultWebhookAttributes,
  HttpMethod,
  PublicTypebot,
  KeyValue,
  ReplyLog,
  ResultInSession,
  ExecutableWebhook,
} from '@typebot.io/schemas'
import { stringify } from 'qs'
import { omit } from '@typebot.io/lib'
import { parseAnswers } from '@typebot.io/lib/results'
import got, { Method, HTTPError, OptionsInit } from 'got'
import { parseSampleResult } from './parseSampleResult'
import { ExecuteIntegrationResponse } from '@/features/chat/types'
import { saveErrorLog } from '@/features/logs/saveErrorLog'
import { saveSuccessLog } from '@/features/logs/saveSuccessLog'
import { parseVariables } from '@/features/variables/parseVariables'
import { resumeWebhookExecution } from './resumeWebhookExecution'

type ParsedWebhook = ExecutableWebhook & {
  basicAuth: { username?: string; password?: string }
  isJson: boolean
}

export const executeWebhookBlock = async (
  state: SessionState,
  block: WebhookBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock
): Promise<ExecuteIntegrationResponse> => {
  const { typebot, result } = state
  let log: ReplyLog | undefined
  const webhook = (await prisma.webhook.findUnique({
    where: { id: block.webhookId },
  })) as Webhook | null
  if (!webhook) {
    log = {
      status: 'error',
      description: `Couldn't find webhook with id ${block.webhookId}`,
    }
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: log.description,
      }))
    return { outgoingEdgeId: block.outgoingEdgeId, logs: [log] }
  }
  const preparedWebhook = prepareWebhookAttributes(webhook, block.options)
  const parsedWebhook = await parseWebhookAttributes(
    typebot,
    block.groupId,
    result
  )(preparedWebhook)
  if (!parsedWebhook) {
    log = {
      status: 'error',
      description: `Couldn't parse webhook attributes`,
    }
    result &&
      (await saveErrorLog({
        resultId: result.id,
        message: log.description,
      }))
    return { outgoingEdgeId: block.outgoingEdgeId, logs: [log] }
  }
  if (block.options.isExecutedOnClient)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          webhookToExecute: parsedWebhook,
        },
      ],
    }
  const webhookResponse = await executeWebhook(parsedWebhook, result)
  return resumeWebhookExecution(state, block)(webhookResponse)
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

const parseWebhookAttributes =
  (
    typebot: SessionState['typebot'],
    groupId: string,
    result: ResultInSession
  ) =>
  async (webhook: Webhook): Promise<ParsedWebhook | undefined> => {
    if (!webhook.url || !webhook.method) return
    const { variables } = typebot
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
      | ExecutableWebhook['headers']
      | undefined
    const queryParams = stringify(
      convertKeyValueTableToObject(webhook.queryParams, variables)
    )
    const bodyContent = await getBodyContent(
      typebot,
      []
    )({
      body: webhook.body,
      result,
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

    return {
      url: parseVariables(variables)(
        webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
      ),
      basicAuth,
      method: webhook.method,
      headers,
      body,
      isJson,
    }
  }

export const executeWebhook = async (
  webhook: ParsedWebhook,
  result: ResultInSession
): Promise<WebhookResponse> => {
  const { headers, url, method, basicAuth, body, isJson } = webhook
  const contentType = headers ? headers['Content-Type'] : undefined

  const request = {
    url,
    method: method as Method,
    headers,
    ...(basicAuth ?? {}),
    json:
      !contentType?.includes('x-www-form-urlencoded') && body && isJson
        ? body
        : undefined,
    form:
      contentType?.includes('x-www-form-urlencoded') && body ? body : undefined,
    body: body && !isJson ? (body as string) : undefined,
  } satisfies OptionsInit
  try {
    const response = await got(request.url, omit(request, 'url'))
    await saveSuccessLog({
      resultId: result.id,
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
        resultId: result.id,
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
      resultId: result.id,
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
    result,
    groupId,
    variables,
  }: {
    body?: string | null
    result?: ResultInSession
    groupId: string
    variables: Variable[]
  }): Promise<string | undefined> => {
    if (!body) return
    return body === '{{state}}'
      ? JSON.stringify(
          result
            ? parseAnswers(typebot, linkedTypebots)(result)
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
