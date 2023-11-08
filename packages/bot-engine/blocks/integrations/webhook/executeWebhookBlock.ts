import {
  WebhookBlock,
  ZapierBlock,
  MakeComBlock,
  PabblyConnectBlock,
  SessionState,
  Webhook,
  Variable,
  WebhookResponse,
  KeyValue,
  ReplyLog,
  ExecutableWebhook,
  AnswerInSessionState,
} from '@typebot.io/schemas'
import { stringify } from 'qs'
import { isDefined, isEmpty, omit } from '@typebot.io/lib'
import { getDefinedVariables, parseAnswers } from '@typebot.io/lib/results'
import got, { Method, HTTPError, OptionsInit } from 'got'
import { resumeWebhookExecution } from './resumeWebhookExecution'
import { ExecuteIntegrationResponse } from '../../../types'
import { parseVariables } from '../../../variables/parseVariables'
import prisma from '@typebot.io/lib/prisma'
import {
  HttpMethod,
  defaultWebhookAttributes,
} from '@typebot.io/schemas/features/blocks/integrations/webhook/constants'

type ParsedWebhook = ExecutableWebhook & {
  basicAuth: { username?: string; password?: string }
  isJson: boolean
}

export const executeWebhookBlock = async (
  state: SessionState,
  block: WebhookBlock | ZapierBlock | MakeComBlock | PabblyConnectBlock
): Promise<ExecuteIntegrationResponse> => {
  const logs: ReplyLog[] = []
  const webhook =
    block.options?.webhook ??
    ('webhookId' in block
      ? ((await prisma.webhook.findUnique({
          where: { id: block.webhookId },
        })) as Webhook | null)
      : null)
  if (!webhook) return { outgoingEdgeId: block.outgoingEdgeId }
  const parsedWebhook = await parseWebhookAttributes(
    state,
    state.typebotsQueue[0].answers
  )({ webhook, isCustomBody: block.options?.isCustomBody })
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
          webhookToExecute: parsedWebhook,
          expectsDedicatedReply: true,
        },
      ],
    }
  const { response: webhookResponse, logs: executeWebhookLogs } =
    await executeWebhook(parsedWebhook)
  return resumeWebhookExecution({
    state,
    block,
    logs: executeWebhookLogs,
    response: webhookResponse,
  })
}

const checkIfBodyIsAVariable = (body: string) => /^{{.+}}$/.test(body)

const parseWebhookAttributes =
  (state: SessionState, answers: AnswerInSessionState[]) =>
  async ({
    webhook,
    isCustomBody,
  }: {
    webhook: Webhook
    isCustomBody?: boolean
  }): Promise<ParsedWebhook | undefined> => {
    if (!webhook.url || !webhook.method) return
    const { typebot } = state.typebotsQueue[0]
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
        webhook.headers?.at(basicAuthHeaderIdx)?.value?.slice(6).split(':') ??
        []
      basicAuth.username = username
      basicAuth.password = password
      webhook.headers?.splice(basicAuthHeaderIdx, 1)
    }
    const headers = convertKeyValueTableToObject(
      webhook.headers,
      typebot.variables
    ) as ExecutableWebhook['headers'] | undefined
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
  webhook: ParsedWebhook
): Promise<{ response: WebhookResponse; logs?: ReplyLog[] }> => {
  const logs: ReplyLog[] = []
  const { headers, url, method, basicAuth, body, isJson } = webhook
  const contentType = headers ? headers['Content-Type'] : undefined

  const request = {
    url,
    method: method as Method,
    headers: headers ?? {},
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
    logs.push({
      status: 'success',
      description: `Webhook successfuly executed.`,
      details: {
        statusCode: response.statusCode,
        request,
        response: safeJsonParse(response.body).data,
      },
    })
    return {
      response: {
        statusCode: response.statusCode,
        data: safeJsonParse(response.body).data,
      },
      logs,
    }
  } catch (error) {
    if (error instanceof HTTPError) {
      const response = {
        statusCode: error.response.statusCode,
        data: safeJsonParse(error.response.body as string).data,
      }
      logs.push({
        status: 'error',
        description: `Webhook returned an error.`,
        details: {
          statusCode: error.response.statusCode,
          request,
          response,
        },
      })
      return { response, logs }
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
        request,
        response,
      },
    })
    return { response, logs }
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
  return isEmpty(body) && isCustomBody !== true
    ? JSON.stringify(
        parseAnswers({
          answers,
          variables: getDefinedVariables(variables),
        })
      )
    : body ?? undefined
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
