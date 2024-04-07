import {
  HttpRequestBlock,
  ZapierBlock,
  MakeComBlock,
  PabblyConnectBlock,
  SessionState,
  HttpRequest,
  Variable,
  HttpResponse,
  KeyValue,
  ChatLog,
  ExecutableHttpRequest,
  AnswerInSessionState,
  TypebotInSession,
} from '@typebot.io/schemas'
import { stringify } from 'qs'
import { isDefined, isEmpty, isNotDefined, omit } from '@typebot.io/lib'
import ky, { HTTPError, Options } from 'ky'
import { resumeWebhookExecution } from './resumeWebhookExecution'
import { ExecuteIntegrationResponse } from '../../../types'
import { parseVariables } from '@typebot.io/variables/parseVariables'
import prisma from '@typebot.io/lib/prisma'
import {
  HttpMethod,
  defaultTimeout,
  defaultWebhookAttributes,
  maxTimeout,
} from '@typebot.io/schemas/features/blocks/integrations/webhook/constants'
import { env } from '@typebot.io/env'
import { parseAnswers } from '@typebot.io/results/parseAnswers'

type ParsedWebhook = ExecutableHttpRequest & {
  basicAuth: { username?: string; password?: string }
  isJson: boolean
}

export const longReqTimeoutWhitelist = [
  'https://api.openai.com',
  'https://retune.so',
  'https://www.chatbase.co',
  'https://channel-connector.orimon.ai',
  'https://api.anthropic.com',
]

export const webhookSuccessDescription = `Webhook successfuly executed.`
export const webhookErrorDescription = `Webhook returned an error.`

type Params = { disableRequestTimeout?: boolean; timeout?: number }

export const executeWebhookBlock = async (
  state: SessionState,
  block: HttpRequestBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock,
  params: Params = {}
): Promise<ExecuteIntegrationResponse> => {
  const logs: ChatLog[] = []
  const webhook =
    block.options?.webhook ??
    ('webhookId' in block
      ? ((await prisma.webhook.findUnique({
          where: { id: block.webhookId },
        })) as HttpRequest | null)
      : null)
  if (!webhook) return { outgoingEdgeId: block.outgoingEdgeId }
  const parsedWebhook = await parseWebhookAttributes({
    webhook,
    isCustomBody: block.options?.isCustomBody,
    typebot: state.typebotsQueue[0].typebot,
    answers: state.typebotsQueue[0].answers,
  })
  if (!parsedWebhook) {
    logs.push({
      status: 'error',
      description: `Couldn't parse webhook attributes`,
    })
    return { outgoingEdgeId: block.outgoingEdgeId, logs }
  }
  if (block.options?.isExecutedOnClient && !state.whatsApp)
    return {
      outgoingEdgeId: block.outgoingEdgeId,
      clientSideActions: [
        {
          type: 'webhookToExecute',
          webhookToExecute: parsedWebhook,
          expectsDedicatedReply: true,
        },
      ],
    }
  const {
    response: webhookResponse,
    logs: executeWebhookLogs,
    startTimeShouldBeUpdated,
  } = await executeWebhook(parsedWebhook, {
    ...params,
    timeout: block.options?.timeout,
  })

  return {
    ...resumeWebhookExecution({
      state,
      block,
      logs: executeWebhookLogs,
      response: webhookResponse,
    }),
    startTimeShouldBeUpdated,
  }
}

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body)

export const parseWebhookAttributes = async ({
  webhook,
  isCustomBody,
  typebot,
  answers,
}: {
  webhook: HttpRequest
  isCustomBody?: boolean
  typebot: TypebotInSession
  answers: AnswerInSessionState[]
}): Promise<ParsedWebhook | undefined> => {
  if (!webhook.url) return
  const basicAuth: { username?: string; password?: string } = {}
  const basicAuthHeaderIdx = webhook.headers?.findIndex(
    (h) =>
      h.key?.toLowerCase() === 'authorization' &&
      h.value?.toLowerCase()?.includes('basic')
  )
  const isUsernamePasswordBasicAuth =
    basicAuthHeaderIdx !== -1 &&
    isDefined(basicAuthHeaderIdx) &&
    webhook.headers?.at(basicAuthHeaderIdx)?.value?.includes(':')
  if (isUsernamePasswordBasicAuth) {
    const [username, password] =
      webhook.headers?.at(basicAuthHeaderIdx)?.value?.slice(6).split(':') ?? []
    basicAuth.username = username
    basicAuth.password = password
    webhook.headers?.splice(basicAuthHeaderIdx, 1)
  }
  const headers = convertKeyValueTableToObject(
    webhook.headers,
    typebot.variables
  ) as ExecutableHttpRequest['headers'] | undefined
  const queryParams = stringify(
    convertKeyValueTableToObject(webhook.queryParams, typebot.variables)
  )
  const bodyContent = await getBodyContent({
    body: webhook.body,
    answers,
    variables: typebot.variables,
    isCustomBody,
  })
  const method = webhook.method ?? defaultWebhookAttributes.method
  const { data: body, isJson } =
    bodyContent && method !== HttpMethod.GET
      ? safeJsonParse(
          parseVariables(typebot.variables, {
            isInsideJson: !checkIfBodyIsAVariable(bodyContent),
          })(bodyContent)
        )
      : { data: undefined, isJson: false }

  return {
    url: parseVariables(typebot.variables)(
      webhook.url + (queryParams !== '' ? `?${queryParams}` : '')
    ),
    basicAuth,
    method,
    headers,
    body,
    isJson,
  }
}

export const executeWebhook = async (
  webhook: ParsedWebhook,
  params: Params = {}
): Promise<{
  response: HttpResponse
  logs?: ChatLog[]
  startTimeShouldBeUpdated?: boolean
}> => {
  const logs: ChatLog[] = []

  const { headers, url, method, basicAuth, isJson } = webhook
  const contentType = headers ? headers['Content-Type'] : undefined

  const isLongRequest = params.disableRequestTimeout
    ? true
    : longReqTimeoutWhitelist.some((whiteListedUrl) =>
        url?.includes(whiteListedUrl)
      )

  const isFormData = contentType?.includes('x-www-form-urlencoded')

  let body = webhook.body

  if (isFormData && isJson) body = parseFormDataBody(body as object)

  const request = {
    url,
    method,
    headers: headers ?? {},
    ...(basicAuth ?? {}),
    json: !isFormData && body && isJson ? body : undefined,
    body: (isFormData && body ? body : undefined) as any,
    timeout: isNotDefined(env.CHAT_API_TIMEOUT)
      ? undefined
      : params.timeout && params.timeout !== defaultTimeout
      ? Math.min(params.timeout, maxTimeout) * 1000
      : isLongRequest
      ? maxTimeout * 1000
      : defaultTimeout * 1000,
  } satisfies Options & { url: string; body: any }

  try {
    const response = await ky(request.url, omit(request, 'url'))
    const body = await response.text()
    logs.push({
      status: 'success',
      description: webhookSuccessDescription,
      details: {
        statusCode: response.status,
        response: safeJsonParse(body).data,
        request,
      },
    })
    return {
      response: {
        statusCode: response.status,
        data: safeJsonParse(body).data,
      },
      logs,
      startTimeShouldBeUpdated: true,
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const responseBody = await error.response.text()
      const response = {
        statusCode: error.response.status,
        data: safeJsonParse(responseBody).data,
      }
      logs.push({
        status: 'error',
        description: webhookErrorDescription,
        details: {
          statusCode: error.response.status,
          request,
          response,
        },
      })
      return { response, logs, startTimeShouldBeUpdated: true }
    }
    if (
      typeof error === 'object' &&
      error &&
      'code' in error &&
      error.code === 'ETIMEDOUT'
    ) {
      const response = {
        statusCode: 408,
        data: { message: `Request timed out.` },
      }
      logs.push({
        status: 'error',
        description: `Webhook request timed out. (${request.timeout}ms)`,
        details: {
          response,
          request,
        },
      })
      return { response, logs, startTimeShouldBeUpdated: true }
    }
    const response = {
      statusCode: 500,
      data: { message: `Error from Typebot server: ${error}` },
    }
    console.error(error)
    logs.push({
      status: 'error',
      description: `Webhook failed to execute.`,
      details: {
        response,
        request,
      },
    })
    return { response, logs, startTimeShouldBeUpdated: true }
  }
}

const getBodyContent = async ({
  body,
  answers,
  variables,
  isCustomBody,
}: {
  body?: string | null
  answers: AnswerInSessionState[]
  variables: Variable[]
  isCustomBody?: boolean
}): Promise<string | undefined> => {
  return body === '{{state}}' || isEmpty(body) || isCustomBody !== true
    ? JSON.stringify(
        parseAnswers({
          answers,
          variables,
        })
      )
    : body ?? undefined
}

export const convertKeyValueTableToObject = (
  keyValues: KeyValue[] | undefined,
  variables: Variable[]
) => {
  if (!keyValues) return
  return keyValues.reduce((object, item) => {
    const key = parseVariables(variables)(item.key)
    const value = parseVariables(variables)(item.value)
    if (isEmpty(key) || isEmpty(value)) return object
    return {
      ...object,
      [key]: value,
    }
  }, {})
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeJsonParse = (json: unknown): { data: any; isJson: boolean } => {
  try {
    return { data: JSON.parse(json as string), isJson: true }
  } catch (err) {
    return { data: json, isJson: false }
  }
}

const parseFormDataBody = (body: object) => {
  const searchParams = new URLSearchParams()
  Object.entries(body as object).forEach(([key, value]) => {
    searchParams.set(key, value)
  })
  return searchParams
}
